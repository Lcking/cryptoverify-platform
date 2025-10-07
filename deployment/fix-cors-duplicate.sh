#!/bin/bash
# 修复 CORS 重复头问题

set -e

echo "🔧 修复 CORS 重复头问题"
echo "======================================"
echo ""

cd /opt/cryptoverify-platform

echo "问题诊断："
echo "- 错误: Access-Control-Allow-Origin 头包含重复值"
echo "- 原因: Caddy 和 Strapi 都设置了 CORS 头"
echo "- 解决: 移除 Caddy 的 CORS 配置，让 Strapi 处理"
echo ""

echo "1️⃣  检查 Strapi CORS 配置..."
if grep -q "strapi::cors" backend/config/middlewares.ts; then
    echo "   ✅ Strapi CORS 中间件已配置"
    grep -A 10 "strapi::cors" backend/config/middlewares.ts | head -15
else
    echo "   ❌ Strapi CORS 中间件未找到"
fi
echo ""

echo "2️⃣  检查 Git 状态..."
git status --short
echo ""

echo "3️⃣  拉取最新代码（包含修复）..."
git pull origin main
echo ""

echo "4️⃣  重启 Caddy 应用新配置..."
docker compose -f deployment/docker-compose.prod.yml restart caddy
echo ""

echo "5️⃣  等待服务启动..."
sleep 5
echo ""

echo "6️⃣  测试 CORS 头..."
echo ""
echo "   测试 OPTIONS 预检请求:"
RESPONSE=$(curl -s -i -X OPTIONS \
  -H "Origin: https://app.gambleverify.com" \
  -H "Access-Control-Request-Method: GET" \
  https://api.gambleverify.com/api/platforms)

echo "$RESPONSE" | head -20
echo ""

# 检查是否有重复的 CORS 头
CORS_COUNT=$(echo "$RESPONSE" | grep -i "access-control-allow-origin" | wc -l | tr -d ' ')
if [ "$CORS_COUNT" -eq "1" ]; then
    echo "   ✅ CORS 头正常（只有 1 个）"
elif [ "$CORS_COUNT" -eq "0" ]; then
    echo "   ⚠️  未找到 CORS 头"
else
    echo "   ❌ CORS 头重复（找到 $CORS_COUNT 个）"
fi
echo ""

echo "7️⃣  测试实际 API 请求:"
API_RESPONSE=$(curl -s -i \
  -H "Origin: https://app.gambleverify.com" \
  https://api.gambleverify.com/api/platforms)

echo "$API_RESPONSE" | head -20
echo ""

HTTP_STATUS=$(echo "$API_RESPONSE" | head -1 | awk '{print $2}')
if [ "$HTTP_STATUS" = "200" ]; then
    echo "   ✅ API 返回 200 OK"
else
    echo "   ❌ API 返回 $HTTP_STATUS"
fi
echo ""

echo "======================================"
echo "✅ 修复完成！"
echo "======================================"
echo ""
echo "📋 验证步骤："
echo ""
echo "1. 打开无痕浏览器窗口"
echo "2. 访问: https://app.gambleverify.com"
echo "3. 按 F12 打开开发者工具"
echo "4. 刷新页面 (Ctrl+Shift+R)"
echo "5. 检查 Console 标签:"
echo "   - 应该不再有 CORS 错误"
echo "   - 应该不再有 'multiple values' 错误"
echo "6. 检查 Network 标签:"
echo "   - api.gambleverify.com 的请求应该都是 200"
echo "7. 检查页面内容:"
echo "   - 应该显示真实数据（不是 Mock Platform）"
echo ""
echo "如果还有问题，运行："
echo "   docker logs cryptoverify-strapi-prod --tail 50"
echo "======================================"
