#!/bin/bash
# 前端生产环境构建脚本

set -e

echo "=========================================="
echo "前端生产环境构建"
echo "=========================================="
echo ""

# 1. 检查环境变量文件
echo "1️⃣  检查环境变量文件..."
if [ -f ".env.production" ]; then
    echo "✅ .env.production 存在"
    echo "--- 内容预览 ---"
    head -5 .env.production
else
    echo "❌ .env.production 不存在"
    exit 1
fi
echo ""

# 2. 临时重命名 .env.local（避免干扰）
echo "2️⃣  临时禁用 .env.local..."
if [ -f ".env.local" ]; then
    mv .env.local .env.local.backup
    echo "✅ .env.local 已重命名为 .env.local.backup"
else
    echo "ℹ️  .env.local 不存在，跳过"
fi
echo ""

# 3. 清理旧的 build
echo "3️⃣  清理旧的 build..."
rm -rf build
echo "✅ 旧 build 已删除"
echo ""

# 4. 构建生产版本
echo "4️⃣  开始构建..."
echo "   使用环境变量:"
echo "   - REACT_APP_ENABLE_CMS=$(grep REACT_APP_ENABLE_CMS .env.production | cut -d '=' -f2)"
echo "   - REACT_APP_CMS_URL=$(grep REACT_APP_CMS_URL .env.production | cut -d '=' -f2)"
echo ""

# 使用 NODE_ENV=production 确保使用 .env.production
NODE_ENV=production npm run build

echo ""
echo "5️⃣  验证构建产物..."
if [ -d "build" ]; then
    echo "✅ build 目录已创建"
    
    # 检查是否包含生产 URL
    if grep -r "api.gambleverify.com" build/static/js > /dev/null 2>&1; then
        echo "✅ 构建产物包含生产 CMS URL"
        echo "   示例:"
        grep -r "api.gambleverify.com" build/static/js | head -2
    else
        echo "❌ 构建产物不包含生产 CMS URL"
        echo "   可能仍在使用本地配置"
    fi
else
    echo "❌ build 目录创建失败"
    exit 1
fi
echo ""

# 6. 恢复 .env.local
echo "6️⃣  恢复 .env.local..."
if [ -f ".env.local.backup" ]; then
    mv .env.local.backup .env.local
    echo "✅ .env.local 已恢复"
fi
echo ""

echo "=========================================="
echo "✅ 构建完成！"
echo "=========================================="
echo ""
echo "📦 构建产物:"
ls -lh build/index.html
echo ""
echo "📝 下一步:"
echo "1. 上传到服务器: scp -r build root@162.14.117.49:/opt/cryptoverify-platform/frontend/"
echo "2. 或运行: bash deploy-frontend.sh"
