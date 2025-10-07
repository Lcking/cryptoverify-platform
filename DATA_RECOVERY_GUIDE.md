# Strapi 数据持久化问题诊断与恢复方案

## 问题现象

- ✅ 管理后台可以登录
- ⚠️ 登录后发现管理员账号不是预期的账号
- ⚠️ 内容数据（platforms、news 等）可能丢失或不完整
- ❓ 不确定数据是否持久化，容器重启后数据是否会丢失

---

## 诊断步骤

### 方式 1：使用诊断脚本（推荐）

```bash
# 在本地
cd /path/to/cryptoverify-platform/deployment
scp diagnose-data.sh root@162.14.117.49:/tmp/

# 在服务器上
ssh root@162.14.117.49
cd /opt/cryptoverify-platform
bash /tmp/diagnose-data.sh > data-diagnosis-report.txt
cat data-diagnosis-report.txt
```

### 方式 2：手动检查关键信息

```bash
# 1. 检查容器内数据库
ssh root@162.14.117.49
docker exec cryptoverify-strapi-prod ls -lah .tmp/
docker exec cryptoverify-strapi-prod du -h .tmp/data.db

# 2. 检查 Docker Volume
docker volume ls | grep strapi
docker volume inspect deployment_strapi_db

# 3. 查看宿主机数据（需要 root 权限）
MOUNTPOINT=$(docker volume inspect deployment_strapi_db --format '{{.Mountpoint}}')
ls -lah "$MOUNTPOINT"

# 4. 查询数据库内容
docker exec cryptoverify-strapi-prod sqlite3 .tmp/data.db "SELECT COUNT(*) FROM admin_users;"
docker exec cryptoverify-strapi-prod sqlite3 .tmp/data.db "SELECT email, username FROM admin_users;"
docker exec cryptoverify-strapi-prod sqlite3 .tmp/data.db "SELECT COUNT(*) FROM platforms;"
```

---

## 常见问题与解决方案

### 问题 1：数据库文件很小（< 200KB）

**症状**：
- `data.db` 文件只有几十到一百多 KB
- 内容表查询结果为 0 或很少
- 管理员只有 1 个，且是最近创建的

**原因**：
- 这是一个**全新的空数据库**
- 之前的数据没有正确持久化，或使用了错误的数据库文件

**解决方案**：
1. **从备份恢复**（如果有）
2. **重新导入内容**（手动或通过脚本）

---

### 问题 2：容器重启后数据重置

**症状**：
- 每次 `docker restart` 或 `docker compose up -d` 后数据都回到初始状态

**原因**：
- Volume 挂载配置错误
- 使用了错误的数据库路径

**诊断**：
```bash
# 查看 docker-compose 配置
grep -A 5 "strapi_db:" /opt/cryptoverify-platform/deployment/docker-compose.prod.yml

# 应该看到：
# strapi_db:/srv/app/.tmp
```

**解决方案**：
如果配置正确但仍然重置，检查是否有多个数据库文件：

```bash
# 在容器内搜索所有 .db 文件
docker exec cryptoverify-strapi-prod find / -name "*.db" -type f 2>/dev/null
```

---

### 问题 3：本地有数据，生产环境为空

**症状**：
- 本地开发环境 `backend/.tmp/data.db` 有完整数据
- 生产环境数据库为空或数据很少

**原因**：
- 本地和生产使用不同的数据库文件（正常情况）
- 数据没有迁移到生产环境

**解决方案 A：从本地备份迁移到生产**

```bash
# 1. 在本地备份数据库
cd /path/to/backend
cp .tmp/data.db .tmp/data.db.local-backup-$(date +%Y%m%d)

# 2. 上传到服务器
scp .tmp/data.db root@162.14.117.49:/tmp/strapi-data.db

# 3. 在服务器上替换数据库
ssh root@162.14.117.49

# 停止容器
cd /opt/cryptoverify-platform
docker compose -f deployment/docker-compose.prod.yml stop strapi

# 备份当前数据库（如果有）
docker compose -f deployment/docker-compose.prod.yml run --rm strapi \
  sh -c "cp .tmp/data.db .tmp/data.db.old-$(date +%Y%m%d-%H%M%S) || true"

# 复制新数据库到容器
docker compose -f deployment/docker-compose.prod.yml run --rm strapi \
  sh -c "cp /tmp/strapi-data.db .tmp/data.db && chmod 644 .tmp/data.db"

# 或者直接复制到 Volume（需要找到 mountpoint）
MOUNTPOINT=$(docker volume inspect deployment_strapi_db --format '{{.Mountpoint}}')
cp /tmp/strapi-data.db "$MOUNTPOINT/data.db"
chmod 644 "$MOUNTPOINT/data.db"

# 重启容器
docker compose -f deployment/docker-compose.prod.yml up -d strapi

# 验证数据
docker exec cryptoverify-strapi-prod sqlite3 .tmp/data.db "SELECT COUNT(*) FROM platforms;"
```

**解决方案 B：手动重新创建内容**

如果数据不多，可以直接在生产环境后台重新创建：
1. 登录 `https://api.gambleverify.com/admin`
2. Content Manager → 逐个创建 Platforms, News, Insights 等
3. 确保发布（Publish）内容

---

### 问题 4：多个管理员账号，不知道用哪个

**症状**：
- 数据库中有多个管理员账号
- 不确定哪个是正确的账号

**诊断**：
```bash
# 查看所有管理员
docker exec cryptoverify-strapi-prod sqlite3 .tmp/data.db \
  "SELECT id, email, username, created_at, updated_at FROM admin_users;"
```

**解决方案**：
```bash
# 如果要删除不需要的账号（假设保留 ID=1 的账号）
docker exec cryptoverify-strapi-prod sqlite3 .tmp/data.db \
  "DELETE FROM admin_users WHERE id != 1;"

# 重置特定账号的密码
# 在 Strapi 后台：Settings → Administration Panel → Users → Reset Password
```

---

## 数据备份策略

### 自动备份脚本

```bash
#!/bin/bash
# 放在服务器上：/opt/backup-strapi-db.sh

BACKUP_DIR="/opt/backups/strapi"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_FILE="$BACKUP_DIR/data.db.$TIMESTAMP"

# 创建备份目录
mkdir -p "$BACKUP_DIR"

# 备份数据库
docker exec cryptoverify-strapi-prod sqlite3 .tmp/data.db ".backup /tmp/backup.db"
docker cp cryptoverify-strapi-prod:/tmp/backup.db "$BACKUP_FILE"

# 压缩备份
gzip "$BACKUP_FILE"

# 保留最近 30 天的备份
find "$BACKUP_DIR" -name "data.db.*" -mtime +30 -delete

echo "Backup created: $BACKUP_FILE.gz"
```

### 设置定时备份（Cron）

```bash
# 在服务器上
crontab -e

# 添加：每天凌晨 2 点备份
0 2 * * * /bin/bash /opt/backup-strapi-db.sh >> /var/log/strapi-backup.log 2>&1
```

---

## 数据恢复流程

### 从备份恢复

```bash
# 1. 列出可用备份
ls -lh /opt/backups/strapi/

# 2. 选择要恢复的备份
BACKUP_FILE="/opt/backups/strapi/data.db.20251007-020000.gz"
gunzip -c "$BACKUP_FILE" > /tmp/restore.db

# 3. 停止容器
cd /opt/cryptoverify-platform
docker compose -f deployment/docker-compose.prod.yml stop strapi

# 4. 备份当前数据库（以防万一）
docker compose -f deployment/docker-compose.prod.yml run --rm strapi \
  sh -c "cp .tmp/data.db .tmp/data.db.before-restore-$(date +%Y%m%d-%H%M%S)"

# 5. 恢复备份
docker cp /tmp/restore.db cryptoverify-strapi-prod:/srv/app/.tmp/data.db
# 或者
MOUNTPOINT=$(docker volume inspect deployment_strapi_db --format '{{.Mountpoint}}')
cp /tmp/restore.db "$MOUNTPOINT/data.db"
chmod 644 "$MOUNTPOINT/data.db"

# 6. 重启容器
docker compose -f deployment/docker-compose.prod.yml up -d strapi

# 7. 验证
docker logs --tail 50 cryptoverify-strapi-prod
```

---

## 验证数据持久化

### 测试流程

```bash
# 1. 在后台创建一条测试数据
# https://api.gambleverify.com/admin
# Content Manager → Platform → Create new entry
# Title: "Test Platform - DELETE ME"
# Slug: "test-platform-delete-me"
# → Save & Publish

# 2. 查询确认数据已保存
docker exec cryptoverify-strapi-prod sqlite3 .tmp/data.db \
  "SELECT id, title, slug FROM platforms WHERE slug='test-platform-delete-me';"

# 3. 重启容器
docker restart cryptoverify-strapi-prod

# 4. 等待启动完成（约 30 秒）
sleep 30

# 5. 再次查询
docker exec cryptoverify-strapi-prod sqlite3 .tmp/data.db \
  "SELECT id, title, slug FROM platforms WHERE slug='test-platform-delete-me';"

# 6. 如果数据仍然存在 → ✅ 持久化正常
#    如果数据丢失 → ❌ 持久化有问题

# 7. 清理测试数据
# 在后台删除 "Test Platform - DELETE ME"
```

---

## 常见错误与修复

### 错误：`database is locked`

**原因**：多个进程同时访问 SQLite 数据库

**解决**：
```bash
# 重启容器
docker restart cryptoverify-strapi-prod
```

### 错误：`attempt to write a readonly database`

**原因**：数据库文件权限问题

**解决**：
```bash
docker exec cryptoverify-strapi-prod chmod 644 .tmp/data.db
docker exec cryptoverify-strapi-prod chown node:node .tmp/data.db
```

---

## 下一步行动

1. **立即执行**：运行诊断脚本，生成报告
2. **评估现状**：根据报告判断数据是否丢失
3. **决策路径**：
   - 如果有备份 → 恢复备份
   - 如果本地有数据 → 迁移到生产
   - 如果都没有 → 手动重新创建内容
4. **设置备份**：配置自动备份策略，避免再次丢失
5. **测试持久化**：按照验证流程确认数据不会丢失

---

## 联系支持

如果遇到问题，提供以下信息：
- 诊断脚本输出 (`data-diagnosis-report.txt`)
- 容器日志 (`docker logs cryptoverify-strapi-prod`)
- Docker volume 信息 (`docker volume inspect deployment_strapi_db`)
