#!/bin/bash
# 本地测试构建 - 验证环境变量注入

echo "🧪 本地测试前端构建"
echo "======================================"
echo ""

cd /Users/ck/Desktop/Project/cryptoverify-platform/frontend

echo "1️⃣  设置环境变量..."
export REACT_APP_ENABLE_CMS=true
export REACT_APP_CMS_URL=https://api.gambleverify.com
export NODE_ENV=production

echo "   REACT_APP_ENABLE_CMS=$REACT_APP_ENABLE_CMS"
echo "   REACT_APP_CMS_URL=$REACT_APP_CMS_URL"
echo ""

echo "2️⃣  清理旧构建..."
rm -rf build
rm -rf node_modules/.cache
echo ""

echo "3️⃣  开始构建..."
npm run build
echo ""

echo "4️⃣  验证构建结果..."
if [ -f build/index.html ]; then
    echo "   ✅ 构建成功"
    ls -lh build/static/js/main.*.js
    echo ""
    
    echo "   检查生产 URL:"
    if grep -q "api.gambleverify.com" build/static/js/main.*.js; then
        COUNT=$(grep -o "api.gambleverify.com" build/static/js/main.*.js | wc -l)
        echo "   ✅ 找到 $COUNT 处 'api.gambleverify.com'"
    else
        echo "   ❌ 未找到生产 URL"
        echo ""
        echo "   检查是否有本地 URL:"
        if grep -q "localhost:1337" build/static/js/main.*.js; then
            echo "   ⚠️  发现 localhost:1337（使用了本地开发配置）"
        fi
    fi
    echo ""
    
    echo "   提取 JS 文件中的 CMS 配置片段:"
    grep -o "https://[^\"']*gambleverify[^\"']*" build/static/js/main.*.js | head -5
else
    echo "   ❌ 构建失败"
    exit 1
fi

echo ""
echo "======================================"
echo "✅ 本地测试完成"
echo ""
echo "如果看到 'api.gambleverify.com'，说明环境变量注入成功"
echo "现在可以提交并部署到服务器了"
echo "======================================"
