#!/bin/bash
# 一键修复脚本 - 在服务器上执行

set -e

echo "🔧 前端 CMS 集成修复脚本"
echo "======================================"
echo ""

cd /opt/cryptoverify-platform

echo "📊 诊断当前状态..."
echo ""

# 1. 检查 docker-compose 配置
echo "1️⃣  检查 Docker Compose 配置..."
if grep -q "REACT_APP_ENABLE_CMS" deployment/docker-compose.prod.yml; then
    echo "   ✅ docker-compose.prod.yml 包含环境变量"
else
    echo "   ❌ docker-compose.prod.yml 缺少环境变量"
fi
echo ""

# 2. 测试 API CORS
echo "2️⃣  测试 API CORS 配置..."
echo "   测试 OPTIONS 预检请求:"
OPTIONS_RESULT=$(curl -s -o /dev/null -w "%{http_code}" -X OPTIONS \
  -H "Origin: https://app.gambleverify.com" \
  -H "Access-Control-Request-Method: GET" \
  https://api.gambleverify.com/api/platforms)
echo "   HTTP $OPTIONS_RESULT $([ "$OPTIONS_RESULT" = "204" ] && echo "✅" || echo "❌")"

echo ""
echo "   测试 GET 请求 CORS 头:"
CORS_HEADER=$(curl -s -I -H "Origin: https://app.gambleverify.com" \
  https://api.gambleverify.com/api/platforms | grep -i "access-control-allow-origin" || echo "missing")
if [[ "$CORS_HEADER" == *"app.gambleverify.com"* ]]; then
    echo "   ✅ CORS 头正确: $CORS_HEADER"
else
    echo "   ❌ CORS 头缺失或错误"
    echo "   需要重启 Caddy"
fi
echo ""

# 3. 停止旧容器
echo "3️⃣  停止并清理旧容器..."
docker compose -f deployment/docker-compose.prod.yml stop frontend-builder || true
docker compose -f deployment/docker-compose.prod.yml rm -f frontend-builder || true
echo ""

# 4. 清理旧构建
echo "4️⃣  清理旧的构建文件..."
rm -rf frontend/build
rm -rf frontend/node_modules/.cache
echo "   ✅ 已清理"
echo ""

# 5. 重新构建
echo "5️⃣  开始重新构建前端..."
echo "   环境变量将在构建时注入到 JavaScript 文件中"
docker compose -f deployment/docker-compose.prod.yml up frontend-builder --force-recreate
echo ""

# 6. 检查构建结果
echo "6️⃣  验证构建结果..."
if [ -f frontend/build/index.html ]; then
    echo "   ✅ 构建成功"
    ls -lh frontend/build/static/js/main.*.js | tail -1
    
    echo ""
    echo "   检查环境变量注入:"
    if grep -q "api.gambleverify.com" frontend/build/static/js/main.*.js 2>/dev/null; then
        COUNT=$(grep -o "api.gambleverify.com" frontend/build/static/js/main.*.js | wc -l | tr -d ' ')
        echo "   ✅ 找到 $COUNT 处 'api.gambleverify.com'"
    else
        echo "   ❌ 未找到 'api.gambleverify.com'"
        echo "   这意味着环境变量未注入，构建使用了默认值"
        exit 1
    fi
    
    echo ""
    echo "   检查 ENABLE_CMS 标志:"
    if grep -q "ENABLE_CMS" frontend/build/static/js/main.*.js 2>/dev/null; then
        echo "   ✅ 找到 ENABLE_CMS"
    else
        echo "   ℹ️  ENABLE_CMS 可能被优化掉了（这是正常的）"
    fi
else
    echo "   ❌ 构建失败"
    exit 1
fi
echo ""

# 7. 重启 Caddy
echo "7️⃣  重启 Caddy 应用新配置..."
docker compose -f deployment/docker-compose.prod.yml restart caddy
echo "   等待 Caddy 启动..."
sleep 5
echo ""

# 8. 最终验证
echo "8️⃣  最终验证..."
echo ""
echo "   A. 测试 OPTIONS 预检（浏览器会先发送这个）:"
OPTIONS_FINAL=$(curl -s -I -X OPTIONS \
  -H "Origin: https://app.gambleverify.com" \
  -H "Access-Control-Request-Method: GET" \
  https://api.gambleverify.com/api/platforms)
echo "$OPTIONS_FINAL" | head -10
if echo "$OPTIONS_FINAL" | grep -qi "access-control-allow-origin"; then
    echo "   ✅ OPTIONS 请求有 CORS 头"
else
    echo "   ❌ OPTIONS 请求缺少 CORS 头"
fi
echo ""

echo "   B. 测试实际 GET 请求:"
GET_FINAL=$(curl -s -I \
  -H "Origin: https://app.gambleverify.com" \
  https://api.gambleverify.com/api/platforms)
if echo "$GET_FINAL" | grep -qi "access-control-allow-origin"; then
    echo "   ✅ GET 请求有 CORS 头"
else
    echo "   ❌ GET 请求缺少 CORS 头"
fi
echo ""

echo "   C. 测试前端页面加载的 JS 文件:"
MAIN_JS=$(curl -s https://app.gambleverify.com/ | grep -o 'static/js/main\.[a-z0-9]*\.js' | head -1)
if [ ! -z "$MAIN_JS" ]; then
    echo "   主 JS 文件: $MAIN_JS"
    if curl -s "https://app.gambleverify.com/$MAIN_JS" | grep -q "api.gambleverify.com"; then
        echo "   ✅ 线上 JS 文件包含生产 URL"
    else
        echo "   ⚠️  线上 JS 文件不包含生产 URL（可能是浏览器缓存）"
    fi
fi
echo ""

echo "======================================"
echo "✅ 修复完成！"
echo "======================================"
echo ""
echo "📋 验证步骤："
echo ""
echo "1. 打开无痕/隐私浏览器窗口（重要！避免缓存）"
echo "2. 访问: https://app.gambleverify.com/cms-debug.html"
echo "3. 点击测试按钮，应该看到 200 响应"
echo ""
echo "4. 或者打开浏览器开发者工具："
echo "   - 访问: https://app.gambleverify.com"
echo "   - F12 → Network 标签"
echo "   - 刷新页面（Ctrl+Shift+R 强制刷新）"
echo "   - 筛选 'api.gambleverify.com'"
echo "   - 应该看到 OPTIONS 和 GET 请求，都是 200/204"
echo ""
echo "5. 如果还是失败，清除浏览器所有缓存："
echo "   Chrome: Ctrl+Shift+Delete → 选择 '全部时间' → 清除"
echo ""
echo "======================================"
