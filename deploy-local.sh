#!/bin/bash
# 本地执行：提交并部署到正确的服务器

echo "📦 提交更改到 Git..."
cd /Users/ck/Desktop/Project/cryptoverify-platform
git add .
git commit -m "fix: 优化 Caddyfile 缓存和 CORS，添加诊断工具"
git push origin main

echo ""
echo "🚀 现在请 SSH 到服务器执行以下命令："
echo "======================================"
echo "ssh root@167.160.189.182"
echo ""
echo "cd /opt/cryptoverify-platform"
echo "git pull"
echo "bash deployment/fix-frontend-cms.sh"
echo "======================================"
