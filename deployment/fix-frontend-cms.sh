#!/bin/bash
# 修复前端 CMS 集成问题 - 诊断和修复脚本
set -e

echo "� 前端 CMS 集成诊断和修复"
echo "======================================"
echo ""

cd /opt/cryptoverify-platform

echo "📊 第一步：诊断当前状态"
echo "--------------------------------------"

echo ""
echo "1️⃣  检查环境变量配置..."
if [ -f frontend/.env.production ]; then
    echo "   ✅ .env.production 存在"
    cat frontend/.env.production
else
    echo "   ❌ .env.production 不存在！"
    exit 1
fi
echo ""

echo "2️⃣  检查当前构建..."
if [ -d frontend/build/static/js ]; then
    echo "   当前构建文件:"
    ls -lh frontend/build/static/js/main.*.js 2>/dev/null || echo "   ⚠️  未找到构建文件"
    echo ""
    echo "   检查是否包含生产 URL:"
    if grep -q "api.gambleverify.com" frontend/build/static/js/main.*.js 2>/dev/null; then
        COUNT=$(grep -o "api.gambleverify.com" frontend/build/static/js/main.*.js | wc -l)
        echo "   ✅ 找到 $COUNT 处引用"
    else
        echo "   ❌ 未找到生产 URL（可能使用本地 localhost:1337）"
    fi
else
    echo "   ⚠️  构建目录不存在"
fi
echo ""

echo "3️⃣  检查 Strapi Public 权限..."
echo "   测试 API 端点:"
PLATFORMS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://api.gambleverify.com/api/platforms)
NEWS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://api.gambleverify.com/api/news)
INSIGHTS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://api.gambleverify.com/api/insights)

echo "   - /api/platforms: $PLATFORMS_STATUS $([ "$PLATFORMS_STATUS" = "200" ] && echo "✅" || echo "❌")"
echo "   - /api/news: $NEWS_STATUS $([ "$NEWS_STATUS" = "200" ] && echo "✅" || echo "❌")"
echo "   - /api/insights: $INSIGHTS_STATUS $([ "$INSIGHTS_STATUS" = "200" ] && echo "✅" || echo "❌")"
echo ""

if [ "$PLATFORMS_STATUS" != "200" ] || [ "$NEWS_STATUS" != "200" ] || [ "$INSIGHTS_STATUS" != "200" ]; then
    echo "⚠️  警告：部分 API 返回非 200 状态码"
    echo "   请检查 Strapi 后台的 Public 角色权限"
    echo "   Settings → Users & Permissions → Roles → Public"
    echo "   需要为所有内容类型启用 find 和 findOne 权限"
    echo ""
fi

echo ""
echo "🔧 第二步：执行修复"
echo "--------------------------------------"

read -p "是否继续重新构建前端？(y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "已取消"
    exit 0
fi

echo ""
echo "4️⃣  清理旧的构建容器..."
docker compose -f deployment/docker-compose.prod.yml rm -f frontend-builder || true
echo ""

echo "5️⃣  强制重新构建前端..."
echo "   这将使用 frontend/.env.production 中的环境变量"
docker compose -f deployment/docker-compose.prod.yml up -d frontend-builder --force-recreate
echo ""

echo "⏳ 等待构建完成（约40秒）..."
for i in {1..40}; do
    echo -n "."
    sleep 1
done
echo ""
echo ""

echo "6️⃣  检查构建日志..."
docker logs --tail 20 cryptoverify-frontend-builder
echo ""

echo "7️⃣  验证新构建..."
echo "   新构建文件:"
ls -lh frontend/build/static/js/main.*.js 2>/dev/null | tail -1
echo ""
echo "   验证生产 URL 是否注入:"
if grep -q "api.gambleverify.com" frontend/build/static/js/main.*.js 2>/dev/null; then
    COUNT=$(grep -o "api.gambleverify.com" frontend/build/static/js/main.*.js | wc -l)
    echo "   ✅ 成功！找到 $COUNT 处 api.gambleverify.com"
else
    echo "   ❌ 失败：仍然未找到生产 URL"
    echo "   检查构建日志中的错误"
    exit 1
fi
echo ""

echo "8️⃣  重启 Caddy 以应用新的缓存配置..."
docker compose -f deployment/docker-compose.prod.yml restart caddy
echo ""

echo "✅ 修复完成！"
echo ""
echo "======================================"
echo "📋 验证步骤"
echo "======================================"
echo ""
echo "方式 1：使用诊断页面（推荐）"
echo "   1. 访问: https://app.gambleverify.com/cms-debug.html"
echo "   2. 查看环境变量检查结果"
echo "   3. 点击 '测试 Platforms API' 等按钮"
echo "   4. 检查 API 响应状态"
echo ""
echo "方式 2：手动检查（无痕模式）"
echo "   1. 打开隐私/无痕浏览器窗口"
echo "   2. 访问: https://app.gambleverify.com"
echo "   3. 按 F12 打开开发者工具"
echo "   4. Network 标签 → 筛选 'api.gambleverify.com'"
echo "   5. 应该看到 4 个 API 请求（platforms/news/insights/exposures）"
echo "   6. Console 标签 → 检查是否有错误"
echo ""
echo "方式 3：命令行验证"
echo "   # 检查前端加载的 JS 文件"
echo "   curl -I https://app.gambleverify.com/"
echo "   "
echo "   # 检查 API 返回的数据"
echo "   curl https://api.gambleverify.com/api/platforms | jq '.data[0].title'"
echo ""
echo "======================================"
