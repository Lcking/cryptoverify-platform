# 前端 CMS 数据对接问题排查与修复

## 问题描述

- ✅ 数据已成功迁移到生产环境 Strapi
- ✅ 本地开发环境前端可以正常显示 CMS 数据
- ❌ 生产环境前端仍显示 mock 数据，无法对接 CMS

---

## 诊断步骤

### 步骤 1：检查 Strapi API 权限配置

生产环境的 Strapi 需要为 **Public 角色**设置 API 访问权限。

```bash
# 访问 Strapi 后台
https://api.gambleverify.com/admin

# 导航到权限设置
Settings → Users & Permissions Plugin → Roles → Public
```

**需要勾选的权限**：

| Content Type | find | findOne |
|--------------|------|---------|
| Platform     | ✅   | ✅      |
| News         | ✅   | ✅      |
| Insights     | ✅   | ✅      |
| Exposures    | ✅   | ✅      |
| Verifications| ✅   | ✅      |

勾选后点击 **Save** 按钮。

---

### 步骤 2：测试 API 端点

在本地终端执行以下命令，测试 API 是否返回数据：

```bash
# 测试 Platforms API
curl https://api.gambleverify.com/api/platforms

# 测试 News API
curl https://api.gambleverify.com/api/news

# 测试 Insights API
curl https://api.gambleverify.com/api/insights
```

**预期结果**：
```json
{
  "data": [
    {
      "id": 1,
      "attributes": {
        "title": "...",
        "slug": "...",
        ...
      }
    }
  ],
  "meta": { ... }
}
```

**如果返回 403 Forbidden**：
- 说明 Public 角色权限未设置
- 返回步骤 1 重新设置权限

**如果返回空数组 `{"data": []}`**：
- 数据库迁移可能失败
- 或者内容未发布（需要在后台 Publish）

---

### 步骤 3：检查前端构建时的环境变量

前端需要在**构建时**（`npm run build`）注入正确的环境变量。

**问题**：生产环境前端 build 文件夹是什么时候构建的？

1. 如果是**本地构建后上传**：需要确保本地有正确的 `.env.production` 文件
2. 如果是**服务器上构建**：需要在服务器上设置环境变量

**检查当前 build 的环境变量**：

```bash
# 在服务器上
cd /opt/cryptoverify-platform/frontend/build/static/js

# 查看是否包含 CMS URL
grep -r "api.gambleverify.com" . || echo "未找到 CMS URL"
grep -r "ENABLE_CMS" . || echo "未找到 ENABLE_CMS"
```

---

### 步骤 4：创建正确的环境变量文件

在**本地**创建 `.env.production` 文件：

```bash
cd /Users/ck/Desktop/Project/cryptoverify-platform/frontend

# 创建生产环境变量
cat > .env.production << 'EOF'
# 启用 CMS
REACT_APP_ENABLE_CMS=true

# Strapi 生产环境 URL
REACT_APP_CMS_URL=https://api.gambleverify.com

# 不需要 token（使用 Public 角色权限）
REACT_APP_CMS_TOKEN=

# 网站 URL（用于 sitemap）
SITE_URL=https://app.gambleverify.com

# 社交媒体链接
REACT_APP_TELEGRAM_URL=https://t.me/cryptoverify
REACT_APP_WHATSAPP_URL=https://wa.me/1234567890
REACT_APP_DISCORD_URL=https://discord.gg/cryptoverify

# 网站配置
REACT_APP_SITE_URL=https://app.gambleverify.com
REACT_APP_SITE_NAME=CryptoVerify
EOF
```

---

### 步骤 5：重新构建前端

在本地重新构建前端：

```bash
cd /Users/ck/Desktop/Project/cryptoverify-platform/frontend

# 安装依赖（如果需要）
npm install

# 使用 .env.production 构建
npm run build

# 验证构建产物中包含 CMS URL
grep -r "api.gambleverify.com" build/static/js | head -5
```

**预期输出**：应该看到 `api.gambleverify.com` 出现在 JS 文件中。

---

### 步骤 6：上传新的 build 到服务器

```bash
# 在本地
cd /Users/ck/Desktop/Project/cryptoverify-platform

# 备份服务器上的旧 build
ssh root@162.14.117.49 "mv /opt/cryptoverify-platform/frontend/build /opt/cryptoverify-platform/frontend/build.old-$(date +%Y%m%d)"

# 上传新 build
scp -r frontend/build root@162.14.117.49:/opt/cryptoverify-platform/frontend/

# 验证上传成功
ssh root@162.14.117.49 "ls -lh /opt/cryptoverify-platform/frontend/build/index.html"
```

---

### 步骤 7：清理浏览器缓存并测试

1. **清理缓存**：
   - 打开浏览器开发者工具（F12）
   - 右键点击刷新按钮 → "清空缓存并硬性重新加载"
   - 或者使用无痕模式访问

2. **访问网站**：
   ```
   https://app.gambleverify.com
   ```

3. **检查网络请求**（F12 → Network）：
   - 应该看到对 `https://api.gambleverify.com/api/platforms` 的请求
   - 请求应该返回 200 状态码和数据

4. **检查控制台**（F12 → Console）：
   - 不应该有 CORS 错误
   - 不应该有 404 错误

---

## 常见问题

### 问题 1：API 返回 403 Forbidden

**原因**：Public 角色权限未设置

**解决**：
1. 登录 Strapi 后台
2. Settings → Users & Permissions → Roles → Public
3. 为所有内容类型勾选 `find` 和 `findOne`
4. Save

---

### 问题 2：前端仍显示 mock 数据

**检查 1**：环境变量是否正确注入

```javascript
// 在浏览器控制台执行
console.log('ENABLE_CMS:', localStorage.getItem('debug') || 'check source');

// 或者查看页面源代码，搜索 "api.gambleverify.com"
```

**检查 2**：前端代码逻辑

```bash
# 检查前端如何使用 CMS 配置
grep -n "ENABLE_CMS" frontend/src/components/**/*.js
```

**解决**：重新构建前端并上传

---

### 问题 3：CORS 错误

**错误信息**：
```
Access to fetch at 'https://api.gambleverify.com/api/platforms' 
from origin 'https://app.gambleverify.com' has been blocked by CORS policy
```

**检查 Strapi CORS 配置**：

```bash
# 在服务器上
cat /opt/cryptoverify-platform/backend/config/middlewares.ts
```

应该包含：
```typescript
cors: {
  enabled: true,
  origin: [
    'http://localhost:3000',
    'https://app.gambleverify.com'  // ← 必须包含前端域名
  ],
}
```

**如果配置错误，修改后重启 Strapi**：
```bash
cd /opt/cryptoverify-platform
docker compose -f deployment/docker-compose.prod.yml restart strapi
```

---

### 问题 4：API 返回空数组

**检查内容是否发布**：
1. 登录 Strapi 后台
2. Content Manager → Platform（或其他内容类型）
3. 检查每条 entry 的状态
4. 如果是 "Draft"，点击 "Publish" 按钮

---

## 验证清单

构建和部署前端后，检查：

- [ ] Strapi Public 角色权限已设置（所有内容类型 find/findOne）
- [ ] API 测试返回数据（不是 403 或空数组）
- [ ] `.env.production` 文件包含正确的 `REACT_APP_CMS_URL`
- [ ] `npm run build` 成功完成
- [ ] build 产物包含 CMS URL（grep 验证）
- [ ] 新 build 已上传到服务器
- [ ] 浏览器清除缓存
- [ ] 前端页面显示 CMS 数据（不是 mock 数据）
- [ ] Network 面板显示成功的 API 请求
- [ ] Console 无 CORS 或 404 错误

---

## 快速修复命令

如果所有配置都正确，只需要重新构建和部署前端：

```bash
# 在本地
cd /Users/ck/Desktop/Project/cryptoverify-platform/frontend

# 1. 确保有 .env.production
cat > .env.production << 'EOF'
REACT_APP_ENABLE_CMS=true
REACT_APP_CMS_URL=https://api.gambleverify.com
SITE_URL=https://app.gambleverify.com
EOF

# 2. 重新构建
npm run build

# 3. 上传到服务器
cd ..
scp -r frontend/build root@162.14.117.49:/opt/cryptoverify-platform/frontend/build-new

# 4. 在服务器上替换
ssh root@162.14.117.49 "cd /opt/cryptoverify-platform/frontend && mv build build.old && mv build-new build"
```

---

## 需要帮助？

如果问题仍未解决，提供以下信息：

1. **API 测试结果**：
   ```bash
   curl -i https://api.gambleverify.com/api/platforms
   ```

2. **前端 build 检查**：
   ```bash
   grep -r "api.gambleverify.com" frontend/build/static/js | head -3
   ```

3. **浏览器 Network 截图**：
   - F12 → Network → 刷新页面
   - 查找对 `/api/platforms` 的请求
   - 显示状态码和响应

4. **浏览器 Console 错误**：
   - F12 → Console
   - 复制所有红色错误信息
