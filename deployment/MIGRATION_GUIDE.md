# 数据库迁移指南：从本地到生产环境

## 问题描述

- **本地环境**：有完整数据（6 个 content-types，6 个 entries）
- **生产环境**：只有结构（6 个 content-types），只有 1 个测试 entry
- **目标**：将本地完整数据迁移到生产环境

---

## 方式 1：自动迁移脚本（推荐）

在**项目根目录**执行：

```bash
cd /Users/ck/Desktop/Project/cryptoverify-platform
bash deployment/migrate-database.sh
```

脚本会自动完成：
1. ✅ 备份本地数据库
2. ✅ 上传到服务器
3. ✅ 备份生产数据库
4. ✅ 替换数据库
5. ✅ 重启容器
6. ✅ 验证数据

---

## 方式 2：手动分步迁移

### 步骤 1：确认本地数据库位置

```bash
# 在项目根目录
cd /Users/ck/Desktop/Project/cryptoverify-platform

# 检查本地数据库
ls -lh backend/.tmp/data.db

# 查看数据库大小（应该 > 200KB）
du -h backend/.tmp/data.db
```

**如果文件不存在**，可能在以下位置：
- `backend/.tmp/data.db`
- `backend/data/data.db`
- `backend/database/data.db`

可以搜索：
```bash
find backend -name "data.db" -type f
```

### 步骤 2：备份本地数据库

```bash
# 创建带时间戳的备份
cp backend/.tmp/data.db backend/.tmp/data.db.backup-$(date +%Y%m%d-%H%M%S)

# 确认备份成功
ls -lh backend/.tmp/data.db*
```

### 步骤 3：上传数据库到服务器

```bash
# 上传到服务器的系统临时目录（不是项目目录）
scp backend/.tmp/data.db root@162.14.117.49:/tmp/strapi-migration.db

# 确认上传成功
ssh root@162.14.117.49 "ls -lh /tmp/strapi-migration.db"
```

**重要说明**：
- `/tmp/strapi-migration.db` 是服务器**系统**的临时目录
- 容器无法直接访问 `/tmp/`
- 我们需要先复制到项目目录，让容器通过 volume 访问

### 步骤 4：在服务器上替换数据库

SSH 到服务器：
```bash
ssh root@162.14.117.49
```

然后执行以下命令：

```bash
cd /opt/cryptoverify-platform

# 0. 【关键步骤】从系统临时目录复制到项目目录
#    这样容器才能通过 volume 挂载访问到文件
cp /tmp/strapi-migration.db backend/strapi-migration.db
ls -lh backend/strapi-migration.db  # 确认复制成功

# 1. 停止 Strapi 容器
docker compose -f deployment/docker-compose.prod.yml stop strapi

# 2. 备份生产环境现有数据库
docker compose -f deployment/docker-compose.prod.yml run --rm strapi \
  sh -c "cp .tmp/data.db .tmp/data.db.old-$(date +%Y%m%d-%H%M%S) 2>/dev/null || echo 'No existing db'"

# 3. 复制新数据库到容器
#    注意：这里用 strapi-migration.db（在项目根目录）
#    而不是 /tmp/strapi-migration.db（容器看不到）
docker compose -f deployment/docker-compose.prod.yml run --rm strapi \
  sh -c "cp strapi-migration.db .tmp/data.db && chmod 644 .tmp/data.db"

# 4. 验证文件已复制
docker compose -f deployment/docker-compose.prod.yml run --rm strapi \
  ls -lh .tmp/data.db

# 5. 启动容器
docker compose -f deployment/docker-compose.prod.yml up -d strapi

# 6. 查看启动日志
docker logs -f cryptoverify-strapi-prod
# (按 Ctrl+C 退出日志查看)
```

### 步骤 5：等待启动完成

```bash
# 等待约 60 秒让 Strapi 完全启动
sleep 60

# 检查容器状态
docker ps | grep strapi
```

### 步骤 6：验证数据迁移

```bash
# 查询数据库内容
docker exec cryptoverify-strapi-prod node -e "
const db = require('better-sqlite3')('.tmp/data.db', { readonly: true });

console.log('管理员数量:', db.prepare('SELECT COUNT(*) as c FROM admin_users').get().c);

const tables = ['platforms', 'news', 'insights', 'exposures', 'verifications'];
console.log('\\n内容统计:');
tables.forEach(t => {
  try {
    const count = db.prepare(\`SELECT COUNT(*) as c FROM \${t}\`).get().c;
    console.log('  ' + t + ':', count);
  } catch(e) {
    console.log('  ' + t + ': 查询失败');
  }
});

db.close();
"
```

**预期结果**：
- 管理员数量：应该显示你本地的管理员数量
- Platforms/News/Insights 等：应该显示 > 0 的数量

### 步骤 7：Web 界面验证

1. **后台验证**：
   - 访问 `https://api.gambleverify.com/admin`
   - 登录（使用本地的管理员账号和密码）
   - Content Manager → 检查各个内容类型的 entries

2. **API 验证**：
   ```bash
   # 测试 Platforms API
   curl https://api.gambleverify.com/api/platforms
   
   # 测试 News API
   curl https://api.gambleverify.com/api/news
   ```

3. **前端验证**：
   - 访问 `https://app.gambleverify.com`
   - 检查首页是否显示 CMS 数据

### 步骤 8：清理临时文件

```bash
# 在服务器上
rm -f /tmp/strapi-migration.db

# 退出 SSH
exit
```

---

## 方式 3：使用 Docker Volume 直接复制

如果上面的方法遇到问题，可以直接操作 Docker Volume：

```bash
# 1. 上传数据库
scp backend/.tmp/data.db root@162.14.117.49:/tmp/new-data.db

# 2. SSH 到服务器
ssh root@162.14.117.49

# 3. 停止容器
cd /opt/cryptoverify-platform
docker compose -f deployment/docker-compose.prod.yml stop strapi

# 4. 获取 Volume 挂载点
MOUNTPOINT=$(docker volume inspect deployment_strapi_db --format '{{.Mountpoint}}')
echo "Volume 路径: $MOUNTPOINT"

# 5. 备份旧数据库
cp "$MOUNTPOINT/data.db" "$MOUNTPOINT/data.db.old-$(date +%Y%m%d-%H%M%S)"

# 6. 复制新数据库
cp /tmp/new-data.db "$MOUNTPOINT/data.db"
chmod 644 "$MOUNTPOINT/data.db"

# 7. 启动容器
docker compose -f deployment/docker-compose.prod.yml up -d strapi

# 8. 验证
docker logs --tail 50 cryptoverify-strapi-prod
```

---

## 常见问题

### 问题 1：登录失败（管理员密码不对）

**原因**：本地和生产的管理员密码不同

**解决**：
1. 使用本地的管理员邮箱和密码登录
2. 或者在后台重置密码

### 问题 2：容器启动失败

**检查日志**：
```bash
docker logs cryptoverify-strapi-prod
```

**可能原因**：
- 数据库文件损坏
- 权限问题
- 版本不兼容

**解决**：从备份恢复
```bash
docker compose -f deployment/docker-compose.prod.yml run --rm strapi \
  sh -c "cp .tmp/data.db.old-YYYYMMDD-HHMMSS .tmp/data.db"
docker compose -f deployment/docker-compose.prod.yml up -d strapi
```

### 问题 3：API 返回空数组

**原因**：Public 角色权限未设置

**解决**：
1. 登录后台 → Settings → Users & Permissions → Roles → Public
2. 为每个内容类型勾选 `find` 和 `findOne` 权限
3. Save

### 问题 4：前端仍显示 mock 数据

**检查**：
```bash
# 检查前端环境变量
grep REACT_APP_ENABLE_CMS frontend/.env.production
# 应该是: REACT_APP_ENABLE_CMS=true
```

**如果需要重新构建前端**：
```bash
cd frontend
npm run build

# 重新上传到服务器
cd ..
scp -r frontend/build root@162.14.117.49:/opt/cryptoverify-platform/frontend/
```

---

## 回滚方案

如果迁移后出现问题：

```bash
ssh root@162.14.117.49
cd /opt/cryptoverify-platform

# 停止容器
docker compose -f deployment/docker-compose.prod.yml stop strapi

# 恢复备份（替换为实际的备份文件名）
docker compose -f deployment/docker-compose.prod.yml run --rm strapi \
  sh -c "cp .tmp/data.db.old-20251007-HHMMSS .tmp/data.db"

# 重启容器
docker compose -f deployment/docker-compose.prod.yml up -d strapi
```

---

## 完成后的验证清单

- [ ] 容器正常运行（`docker ps`）
- [ ] 后台可以登录
- [ ] Content Manager 显示所有 entries
- [ ] API 返回完整数据（不是空数组）
- [ ] 前端显示 CMS 数据（不是 mock 数据）
- [ ] 无错误日志

---

## 需要帮助？

如果遇到问题，请提供：
1. 错误日志：`docker logs cryptoverify-strapi-prod`
2. 数据库查询结果（上面的验证命令输出）
3. API 响应示例：`curl https://api.gambleverify.com/api/platforms`
