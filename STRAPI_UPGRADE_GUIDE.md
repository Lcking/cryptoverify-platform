# Strapi 版本升级指南

## 升级方式对比

**❌ 错误方式**：
- 在 Strapi 后台点击版本提示下载压缩包 → 那只是 release notes，不能用来升级

**✅ 正确方式**：
- 通过 npm 修改 `package.json` 中的版本号，重新安装依赖

---

## 升级步骤（本地 → 线上）

### 阶段 1：本地升级与测试

```bash
cd /path/to/backend

# 方式 A：使用 Strapi 内置升级脚本
npm run upgrade:dry    # 干运行，查看会改什么
npm run upgrade        # 实际升级

# 方式 B：手动修改版本号（更可控）
# 编辑 backend/package.json，将所有 Strapi 包从旧版本改为新版本
# 例如：5.25.0 → 5.26.0
#   "@strapi/plugin-cloud": "5.26.0",
#   "@strapi/plugin-users-permissions": "5.26.0",
#   "@strapi/strapi": "5.26.0"

# 安装新版本
npm install

# 本地测试启动
npm run develop
```

### 阶段 2：验证本地功能

1. 访问 `http://localhost:1337/admin`，确认登录正常
2. 测试内容创建、编辑、发布
3. 测试 API 端点：`curl http://localhost:1337/api/platforms`
4. 检查控制台是否有新的错误或警告

### 阶段 3：提交代码

```bash
git add backend/package.json backend/package-lock.json
git commit -m "upgrade: Strapi X.X.X -> Y.Y.Y"
git push
```

### 阶段 4：线上部署升级

```bash
cd /opt/cryptoverify-platform

# 1. 【重要】备份数据库
docker compose -f deployment/docker-compose.prod.yml exec strapi \
  cp .tmp/data.db .tmp/data.db.backup-$(date +%Y%m%d-%H%M%S)

# 2. 拉取最新代码
git pull

# 3. 清理旧构建产物
docker run --rm -v "$PWD/backend":/srv/app -w /srv/app alpine \
  sh -c "rm -rf dist .cache node_modules"

# 4. 强制重建容器（会自动 npm ci && build）
docker compose -f deployment/docker-compose.prod.yml up -d --force-recreate strapi

# 5. 等待构建完成（约 1-2 分钟）
sleep 120

# 6. 查看启动日志
docker logs --tail 50 cryptoverify-strapi-prod
```

### 阶段 5：验证线上功能

1. **后台登录**：访问 `https://api.gambleverify.com/admin`
   - 应该能正常登录
   - 查看日志确认无 "Cannot send secure cookie" 错误
   - 确认看到 `🔒 Protocol override middleware registered`

2. **API 测试**：
```bash
curl https://api.gambleverify.com/api/platforms
curl https://api.gambleverify.com/api/search?q=test
```

3. **前端验证**：访问 `https://app.gambleverify.com`
   - 确认能正常显示 CMS 数据

---

## 常见升级警告与处理

### 警告：`[decrypt] Unable to decrypt value`

**现象**：
```
[decrypt] Unable to decrypt value — encryption key may have changed or data is corrupted.
```

**原因**：
- 数据库中存储了使用旧 `ENCRYPTION_KEY` 加密的 API Token
- 升级或环境变更后 key 不匹配，无法解密

**影响**：
- ✅ 不影响管理后台和内容管理
- ✅ 不影响 Public 角色的 API 访问（前端调用）
- ⚠️ 旧的 API Token 将失效

**解决方案 1**：删除旧 token（推荐）
```bash
docker compose -f deployment/docker-compose.prod.yml exec strapi \
  node -e "
    const sqlite3 = require('better-sqlite3');
    const db = new sqlite3('.tmp/data.db');
    db.prepare('DELETE FROM strapi_api_tokens').run();
    console.log('Old tokens deleted');
    db.close();
  "
```

**解决方案 2**：在后台重新创建 token
1. Settings → API Tokens
2. 删除所有旧 token
3. 创建新 token

---

## 升级注意事项

### ⚠️ 必须操作

1. **升级前备份数据库**
   - SQLite：备份 `.tmp/data.db` 文件
   - Postgres/MySQL：导出 SQL dump

2. **清理构建缓存**
   - 删除 `dist/`、`.cache/`、`node_modules/`
   - 否则可能使用旧代码

3. **强制重建容器**
   - 使用 `--force-recreate` 参数
   - 确保执行新的 `npm ci && npm run build`

### 🔍 验证清单

- [ ] 管理后台能登录
- [ ] 日志无 "secure cookie" 错误
- [ ] 中间件日志正常（`Protocol override middleware registered`）
- [ ] API 返回 200 和数据
- [ ] 前端能正常显示 CMS 内容
- [ ] 无新的错误或严重警告

### 🚨 回滚方案

如果升级后出现问题：

```bash
cd /opt/cryptoverify-platform

# 1. 回到上一个提交
git log --oneline -5           # 找到升级前的 commit
git checkout <previous-commit>

# 2. 恢复数据库（如果需要）
docker compose -f deployment/docker-compose.prod.yml exec strapi \
  cp .tmp/data.db.backup-YYYYMMDD-HHMMSS .tmp/data.db

# 3. 重建容器
docker run --rm -v "$PWD/backend":/srv/app -w /srv/app alpine \
  sh -c "rm -rf dist .cache node_modules"
docker compose -f deployment/docker-compose.prod.yml up -d --force-recreate strapi
```

---

## Koa 中间件兼容性

### 关键问题：升级是否会影响我们的协议覆盖中间件？

**答案**（基于 5.26.0）：
- ✅ **Strapi 5.26.0 仍未修复 HTTPS 检测问题**
- ✅ **中间件仍然必需**，且在 5.26.0 上正常工作
- ✅ 升级后日志应显示 `🔒 Protocol override middleware registered`

### 测试是否可以移除中间件

如果未来 Strapi 修复了 HTTPS 检测问题，可以尝试：

1. 注释掉 `backend/src/index.ts` 中的 middleware 代码
2. 重新编译并测试登录
3. 如果登录失败，说明仍需保留中间件

---

## 升级记录

| 版本 | 日期 | 主要变化 | 兼容性 | 备注 |
|------|------|----------|--------|------|
| 5.25.0 → 5.26.0 | 2025-10-07 | 小版本更新，bug 修复 | ✅ 协议中间件兼容 | 出现 decrypt 警告（可忽略）|

---

## 相关文档

- [Strapi 官方升级指南](https://docs.strapi.io/dev-docs/upgrade-tool)
- [本项目部署指南](./DEPLOYMENT_GUIDE.md)
- [后台登录问题排查](./agentwork.md#task-012)
