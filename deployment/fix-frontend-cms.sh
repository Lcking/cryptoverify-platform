#!/bin/bash
# 修复前端 CMS 集成问题
set -e

echo "🔧 修复前端 CMS 集成问题"
echo "======================================"
echo ""

cd /opt/cryptoverify-platform

echo "1️⃣  检查当前构建状态..."
echo "   环境变量文件:"
cat frontend/.env.production
echo ""
echo "   构建文件:"
ls -lh frontend/build/static/js/main.*.js | tail -1
echo ""

echo "2️⃣  强制重新构建前端..."
docker compose -f deployment/docker-compose.prod.yml rm -f frontend-builder
docker compose -f deployment/docker-compose.prod.yml up -d frontend-builder --force-recreate
echo ""

echo "⏳ 等待构建完成（约30秒）..."
sleep 30
echo ""

echo "3️⃣  检查构建日志..."
docker logs --tail 15 cryptoverify-frontend-builder
echo ""

echo "4️⃣  验证构建产物..."
echo "   新构建文件:"
ls -lh frontend/build/static/js/main.*.js | tail -1
echo ""
echo "   检查生产 URL:"
grep -c "api.gambleverify.com" frontend/build/static/js/main.*.js || echo "   ⚠️  未找到生产 URL"
echo ""

echo "5️⃣  重启 Caddy 以应用新的缓存配置..."
docker compose -f deployment/docker-compose.prod.yml restart caddy
echo ""

echo "✅ 部署完成！"
echo ""
echo "======================================"
echo "📋 下一步验证："
echo "======================================"
echo "1. 打开隐私/无痕浏览器窗口"
echo "2. 访问: https://app.gambleverify.com"
echo "3. 打开开发者工具 (F12)"
echo "4. 查看 Console 标签，检查是否有错误"
echo "5. 查看 Network 标签，筛选 'api.gambleverify.com'"
echo "6. 应该看到以下请求:"
echo "   - GET /api/platforms"
echo "   - GET /api/news"
echo "   - GET /api/insights"
echo "   - GET /api/exposures"
echo ""
echo "如果还是显示 mock 数据，请运行:"
echo "   curl -I https://app.gambleverify.com/static/js/main.*.js"
echo "======================================"
