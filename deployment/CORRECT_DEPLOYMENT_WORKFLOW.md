# 前端 CMS 对接 - 正确的部署流程

## 问题回顾

- ❌ **错误方式**：本地构建 → scp 上传到服务器
- ✅ **正确方式**：本地构建 → Git commit & push → 服务器 git pull

## 为什么要通过 Git？

1. **版本控制**：所有更改都有记录，可以追溯和回滚
2. **团队协作**：其他开发者可以看到更改
3. **CI/CD 友好**：可以接入自动化部署
4. **数据安全**：不怕手误删除或覆盖错误的文件
5. **一致性**：确保本地、Git 仓库、服务器三者一致

---

## 正确的部署流程

### 步骤 1：本地重新构建（使用生产环境变量）

```bash
cd /Users/ck/Desktop/Project/cryptoverify-platform/frontend

# 方法 A：临时移除 .env.local（推荐）
mv .env.local .env.local.backup
rm -rf build
npm run build
mv .env.local.backup .env.local

# 或 方法 B：使用命令行环境变量
rm -rf build
REACT_APP_ENABLE_CMS=true \
REACT_APP_CMS_URL=https://api.gambleverify.com \
npm run build

# 验证构建产物
grep -r "api.gambleverify.com" build/static/js | head -3
```

**预期输出**：应该看到 `api.gambleverify.com` 出现在 JS 文件中

---

### 步骤 2：提交到 Git

```bash
cd /Users/ck/Desktop/Project/cryptoverify-platform

# 查看当前更改
git status

# 添加更改的文件
git add frontend/.env.production
git add frontend/build/

# 提交
git commit -m "feat: 配置生产环境 CMS 连接并重新构建前端

- 添加 .env.production 配置 CMS 生产环境 URL
- 重新构建前端以使用生产环境变量
- 修复前端无法连接 Strapi CMS 的问题"

# 推送到 GitHub
git push origin main
```

**注意**：检查 `.gitignore` 是否排除了 `build/` 目录

---

### 步骤 3：检查 .gitignore

如果 `build/` 被 `.gitignore` 排除了，有两种方案：

#### 方案 A：将 build 添加到 Git（简单但不推荐）

```bash
# 编辑 .gitignore，注释掉或删除 build/ 这一行
vim frontend/.gitignore

# 强制添加 build 目录
git add -f frontend/build/

# 提交并推送
git commit -m "chore: 包含前端 build 产物以便部署"
git push origin main
```

#### 方案 B：在服务器上重新构建（推荐）

如果 `build/` 在 `.gitignore` 中（这是最佳实践），那么应该：

1. **只提交源代码和环境变量**
2. **在服务器上重新构建**

```bash
# 本地：只提交源代码和配置
git add frontend/.env.production frontend/src/ frontend/package.json
git commit -m "feat: 配置生产环境 CMS URL"
git push origin main
```

---

### 步骤 4：服务器拉取并构建

SSH 到服务器：

```bash
ssh root@162.14.117.49
cd /opt/cryptoverify-platform

# 拉取最新代码
git pull origin main

# 进入前端目录
cd frontend

# 安装依赖（如果 package.json 有更新）
npm install

# 构建生产版本
npm run build

# 验证构建产物
ls -lh build/index.html
grep -r "api.gambleverify.com" build/static/js | head -3
```

**重要**：服务器构建时会自动使用 `.env.production` 文件（因为 `NODE_ENV=production`）

---

### 步骤 5：验证前端

1. **清除浏览器缓存**：
   - 打开 `https://app.gambleverify.com`
   - F12 → 右键刷新按钮 → "清空缓存并硬性重新加载"

2. **检查 Network 请求**：
   - F12 → Network 标签
   - 应该看到对 `https://api.gambleverify.com/api/platforms` 的请求

3. **检查页面内容**：
   - 页面应该显示 CMS 数据而不是 mock 数据

---

## 关键文件检查

### 1. 检查 frontend/.gitignore

```bash
cat frontend/.gitignore | grep -E "build|\.env"
```

**典型配置**：
```gitignore
# Production build
/build

# Environment files
.env.local
.env.development.local
.env.test.local
.env.production.local

# 但保留示例文件
!.env.example
!.env.production  # ← 如果想提交到 Git
```

### 2. 检查 frontend/.env.production

```bash
cat frontend/.env.production
```

**应该包含**：
```bash
REACT_APP_ENABLE_CMS=true
REACT_APP_CMS_URL=https://api.gambleverify.com
```

---

## 两种部署策略对比

### 策略 A：提交 build 产物

**优点**：
- 服务器不需要 Node.js 环境
- 部署速度快（直接 git pull）
- 不需要在服务器上安装依赖

**缺点**：
- Git 仓库变大（build 文件较大）
- 每次构建都会产生大量 diff
- 不符合最佳实践

**适用场景**：
- 简单的静态网站
- 没有 CI/CD 的项目

---

### 策略 B：服务器构建（推荐）

**优点**：
- Git 仓库干净，只包含源代码
- 符合最佳实践
- 可以针对服务器环境优化构建

**缺点**：
- 服务器需要 Node.js 环境
- 部署时间稍长（需要 npm install + build）

**适用场景**：
- 专业的 Web 应用
- 有 CI/CD 流程的项目
- 多环境部署（dev/staging/prod）

---

## 我们项目的推荐方案

基于你的项目，建议使用 **策略 B（服务器构建）**：

```bash
# 本地
cd /Users/ck/Desktop/Project/cryptoverify-platform

# 1. 确保 .env.production 正确
cat > frontend/.env.production << 'EOF'
REACT_APP_ENABLE_CMS=true
REACT_APP_CMS_URL=https://api.gambleverify.com
SITE_URL=https://app.gambleverify.com
REACT_APP_SITE_URL=https://app.gambleverify.com
REACT_APP_SITE_NAME=CryptoVerify
EOF

# 2. 提交配置文件
git add frontend/.env.production
git commit -m "feat: 添加生产环境 CMS 配置"
git push origin main

# 3. 服务器构建
ssh root@162.14.117.49 << 'ENDSSH'
cd /opt/cryptoverify-platform
git pull origin main
cd frontend
rm -rf build
npm run build
grep -r "api.gambleverify.com" build/static/js | head -3
ENDSSH
```

---

## 自动化部署脚本

为了简化流程，可以创建一个部署脚本：

```bash
#!/bin/bash
# deploy.sh - 本地执行，自动部署到生产环境

set -e

echo "🚀 开始部署..."

# 1. 提交并推送
echo "📦 推送代码到 GitHub..."
git add .
git commit -m "${1:-Update frontend}" || echo "没有更改需要提交"
git push origin main

# 2. 服务器拉取并构建
echo "🔄 服务器拉取并构建..."
ssh root@162.14.117.49 << 'ENDSSH'
cd /opt/cryptoverify-platform
git pull origin main
cd frontend
npm install
rm -rf build
npm run build
echo "✅ 构建完成"
ENDSSH

echo "✅ 部署完成！"
echo "🌐 访问: https://app.gambleverify.com"
```

使用方法：
```bash
bash deploy.sh "更新前端 CMS 配置"
```

---

## 快速修复当前问题

立即执行以下命令修复前端 CMS 对接：

```bash
# 在本地
cd /Users/ck/Desktop/Project/cryptoverify-platform

# 提交环境变量文件
git add frontend/.env.production
git commit -m "feat: 添加生产环境 CMS URL 配置"
git push origin main

# 在服务器上拉取并重新构建
ssh root@162.14.117.49 "cd /opt/cryptoverify-platform && git pull && cd frontend && rm -rf build && npm run build"
```

执行完毕后，清除浏览器缓存并访问 `https://app.gambleverify.com`。

---

## 注意事项

1. **环境变量安全**：
   - `.env.production` 包含公开 URL，可以提交到 Git
   - 如果包含敏感信息（如 API token），使用 `.env.production.local`（不提交）

2. **构建时间**：
   - 服务器首次构建可能需要 2-3 分钟
   - 后续构建会更快（因为依赖已缓存）

3. **Caddy 配置**：
   - 确保 `docker-compose.prod.yml` 中 Caddy 正确挂载了 `frontend/build` 目录
   - 检查：`volumes: - ../frontend/build:/srv/www:ro`

4. **缓存问题**：
   - 前端更新后一定要清除浏览器缓存
   - 或者在无痕模式下测试
