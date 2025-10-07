#!/bin/bash
# 前端 CMS 集成诊断脚本

echo "========================================"
echo "前端 CMS 集成诊断"
echo "========================================"
echo ""

echo "1️⃣  检查服务器上的 .env.production 文件..."
cat /opt/cryptoverify-platform/frontend/.env.production
echo ""

echo "2️⃣  检查构建产物中的环境变量..."
echo "   查找 api.gambleverify.com:"
grep -o "api\.gambleverify\.com" /opt/cryptoverify-platform/frontend/build/static/js/main.*.js | head -1 || echo "   ❌ 未找到"
echo ""

echo "   查找 localhost:1337:"
grep -o "localhost:1337" /opt/cryptoverify-platform/frontend/build/static/js/main.*.js | head -1 && echo "   ⚠️  发现本地 URL！" || echo "   ✅ 未发现本地 URL"
echo ""

echo "3️⃣  检查构建产物的创建时间..."
ls -lh /opt/cryptoverify-platform/frontend/build/static/js/main.*.js
echo ""

echo "4️⃣  检查前端构建容器日志（最后20行）..."
docker logs --tail 20 cryptoverify-frontend-builder
echo ""

echo "5️⃣  测试 API 端点..."
echo "   GET /api/platforms:"
curl -s https://api.gambleverify.com/api/platforms | jq -r '.data[0].title' 2>/dev/null || echo "   ❌ 请求失败"
echo ""

echo "6️⃣  检查前端页面源代码..."
echo "   下载首页 HTML:"
curl -s https://app.gambleverify.com/ | grep -o "main\.[a-z0-9]*\.js" | head -1
echo ""

echo "7️⃣  检查实际服务的 JS 文件..."
MAIN_JS=$(curl -s https://app.gambleverify.com/ | grep -o "main\.[a-z0-9]*\.js" | head -1)
if [ ! -z "$MAIN_JS" ]; then
  echo "   主 JS 文件: $MAIN_JS"
  echo "   检查是否包含生产 URL:"
  curl -s "https://app.gambleverify.com/static/js/$MAIN_JS" | grep -o "api\.gambleverify\.com" | head -1 || echo "   ❌ 未找到生产 URL"
fi
echo ""

echo "========================================"
echo "诊断完成"
echo "========================================"
