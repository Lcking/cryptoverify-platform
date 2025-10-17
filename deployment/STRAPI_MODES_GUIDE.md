# Strapi 生产/开发模式说明

## 问题

线上 Strapi 点击 Content-Type Builder 时提示：
```
Strapi is in production mode, editing content types is disabled. 
Please switch to development mode by starting your server with strapi develop.
```

## 原因

这是 Strapi 的**正常且推荐**的行为！

### Strapi 两种模式对比

| 特性 | Development Mode | Production Mode |
|------|-----------------|-----------------|
| 启动命令 | `npm run develop` | `npm run start` |
| 编辑内容类型 | ✅ 可以 | ❌ 不可以（安全特性） |
| 编辑内容数据 | ✅ 可以 | ✅ 可以 |
| 性能 | 较低（代码热更新） | 高（优化编译） |
| 适用场景 | 本地开发 | 生产环境 |

## 为什么生产环境要禁用内容类型编辑？

1. **数据安全**：防止误删字段导致数据丢失
2. **性能优化**：生产模式性能更好
3. **稳定性**：避免线上结构变更导致系统崩溃
4. **最佳实践**：Strapi 官方强烈推荐

## 你仍然可以做什么？

在生产模式下：

✅ **可以操作**：
- 添加/编辑/删除内容数据（Content Manager）
- 管理用户和权限（Users & Permissions）
- 上传媒体文件（Media Library）
- 配置 API 权限（Settings → Roles）
- 查看所有设置

❌ **不能操作**：
- 修改内容类型结构（Content-Type Builder）
- 添加/删除字段
- 修改字段类型

## 正确的内容类型修改流程

### 方案 1：本地开发 → 生产部署（强烈推荐）

```bash
# 1️⃣  本地开发模式修改
cd /Users/ck/Desktop/Project/cryptoverify-platform/backend
npm run develop

# 2️⃣  在浏览器 http://localhost:1337/admin 中：
#     Content-Type Builder → 修改内容类型

# 3️⃣  提交代码
cd ..
git add .
git commit -m "feat: 修改内容类型结构"
git push origin main

# 4️⃣  服务器拉取并重启
ssh root@167.160.189.182
cd /opt/cryptoverify-platform
git pull
docker compose -f deployment/docker-compose.prod.yml restart strapi

# 5️⃣  验证
# 访问 https://api.gambleverify.com/admin
# 检查新字段是否存在
```

### 方案 2：临时切换生产为开发模式（不推荐）

**⚠️ 警告**：仅用于紧急情况，修改完立即切回生产模式！

```bash
# 1️⃣  SSH 到服务器
ssh root@167.160.189.182
cd /opt/cryptoverify-platform

# 2️⃣  运行切换脚本
chmod +x deployment/switch-to-develop-mode.sh
bash deployment/switch-to-develop-mode.sh

# 3️⃣  访问后台修改内容类型
# https://api.gambleverify.com/admin
# Content-Type Builder → 修改

# 4️⃣  修改完成后，立即恢复生产模式
bash deployment/restore-production-mode.sh
```

## 影响分析

### 如果切换为开发模式

**不会影响**：
- ✅ 现有数据不会丢失
- ✅ 用户访问前端网站不受影响（API 仍然工作）
- ✅ 数据库结构修改后会自动迁移

**会影响**：
- ⚠️  性能降低（开发模式未优化）
- ⚠️  服务器资源占用增加
- ⚠️  可能误操作删除字段导致数据丢失

### 切回生产模式

- ✅ 性能恢复正常
- ✅ 资源占用降低
- ✅ 内容类型结构锁定，更安全

## 最佳实践建议

1. **永远在本地开发模式修改内容类型**
2. **生产环境始终用 production mode**
3. **内容类型结构稳定后，尽量不修改**
4. **如果必须修改，提前备份数据库**
5. **修改后同步更新前端 normalize 逻辑**

## 常见误区

❌ **错误认知**：生产环境应该用开发模式，方便随时修改  
✅ **正确认知**：生产环境必须用生产模式，修改通过本地开发+部署流程

❌ **错误认知**：提示错误，需要修复  
✅ **正确认知**：这是正常且推荐的安全特性

## 参考文档

- [Strapi 官方文档：Development vs Production](https://docs.strapi.io/dev-docs/configurations/environment)
- [Strapi 官方文档：Content-Type Builder](https://docs.strapi.io/user-docs/content-type-builder)

---

> **结论**：你的配置是正确的！这个提示是正常的，不需要"修复"。如需修改内容类型，按照上述流程操作即可。
