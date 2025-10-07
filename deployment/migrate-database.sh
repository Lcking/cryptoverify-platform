#!/bin/bash
# Strapi 数据库迁移脚本：从本地迁移到生产环境
# 使用方法: bash migrate-database.sh

set -e

SERVER="root@162.14.117.49"
PROJECT_PATH="/opt/cryptoverify-platform"
LOCAL_DB="./backend/.tmp/data.db"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

echo "=========================================="
echo "Strapi 数据库迁移工具"
echo "从本地迁移到生产环境"
echo "时间: $(date)"
echo "=========================================="
echo ""

# 检查本地数据库是否存在
if [ ! -f "$LOCAL_DB" ]; then
    echo "❌ 错误: 本地数据库文件不存在"
    echo "   路径: $LOCAL_DB"
    echo "   请确保在项目根目录执行此脚本"
    exit 1
fi

LOCAL_DB_SIZE=$(du -h "$LOCAL_DB" | cut -f1)
echo "✅ 找到本地数据库"
echo "   路径: $LOCAL_DB"
echo "   大小: $LOCAL_DB_SIZE"
echo ""

# 确认操作
echo "⚠️  警告: 此操作将替换生产环境的数据库"
echo "   生产环境现有数据将被备份到 .tmp/data.db.before-migration-$TIMESTAMP"
echo ""
read -p "是否继续? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "操作已取消"
    exit 0
fi

echo ""
echo "开始迁移流程..."
echo ""

# 步骤 1: 备份本地数据库
echo "1️⃣  备份本地数据库..."
cp "$LOCAL_DB" "$LOCAL_DB.backup-$TIMESTAMP"
echo "✅ 本地备份已创建: $LOCAL_DB.backup-$TIMESTAMP"
echo ""

# 步骤 2: 上传数据库到服务器
echo "2️⃣  上传数据库到服务器..."
scp "$LOCAL_DB" "$SERVER:/tmp/strapi-data-migration.db"
UPLOAD_SIZE=$(ssh "$SERVER" "du -h /tmp/strapi-data-migration.db | cut -f1")
echo "✅ 上传完成"
echo "   服务器临时文件: /tmp/strapi-data-migration.db"
echo "   大小: $UPLOAD_SIZE"
echo ""

# 步骤 3: 在服务器上执行迁移
echo "3️⃣  在服务器上执行数据库替换..."
ssh "$SERVER" << ENDSSH
set -e

cd "$PROJECT_PATH"

echo "  → 停止 Strapi 容器..."
docker compose -f deployment/docker-compose.prod.yml stop strapi

echo "  → 备份生产数据库..."
docker compose -f deployment/docker-compose.prod.yml run --rm strapi \
  sh -c "cp .tmp/data.db .tmp/data.db.before-migration-$TIMESTAMP 2>/dev/null || echo '(无现有数据库)'"

echo "  → 复制新数据库到容器..."
docker compose -f deployment/docker-compose.prod.yml run --rm strapi \
  sh -c "cp /tmp/strapi-data-migration.db .tmp/data.db && chmod 644 .tmp/data.db && chown node:node .tmp/data.db"

echo "  → 验证数据库文件..."
NEW_DB_SIZE=\$(docker compose -f deployment/docker-compose.prod.yml run --rm strapi du -h .tmp/data.db | cut -f1)
echo "     新数据库大小: \$NEW_DB_SIZE"

echo "  → 启动 Strapi 容器..."
docker compose -f deployment/docker-compose.prod.yml up -d strapi

echo "  → 等待容器启动..."
sleep 10

echo "  → 检查容器状态..."
docker ps | grep strapi || echo "容器未运行！"

echo "  → 清理临时文件..."
rm -f /tmp/strapi-data-migration.db

ENDSSH

echo "✅ 服务器端操作完成"
echo ""

# 步骤 4: 等待 Strapi 启动
echo "4️⃣  等待 Strapi 完全启动..."
echo "   (约需 30-60 秒完成构建和启动)"
for i in {1..6}; do
    echo -n "   等待中... ($i/6)"
    sleep 10
    echo " ✓"
done
echo ""

# 步骤 5: 验证迁移
echo "5️⃣  验证数据迁移..."

ssh "$SERVER" << 'VERIFY'
cd /opt/cryptoverify-platform

echo "  → 检查容器日志 (最后 20 行)..."
docker logs --tail 20 cryptoverify-strapi-prod

echo ""
echo "  → 查询数据库内容..."
docker exec cryptoverify-strapi-prod node -e "
const db = require('better-sqlite3')('.tmp/data.db', { readonly: true });

console.log('管理员账号数量:', db.prepare('SELECT COUNT(*) as c FROM admin_users').get().c);

const tables = ['platforms', 'news', 'insights', 'exposures', 'verifications'];
console.log('\\n内容统计:');
tables.forEach(t => {
  try {
    const count = db.prepare(\`SELECT COUNT(*) as c FROM \${t}\`).get().c;
    console.log('  ' + t + ':', count);
  } catch(e) {
    console.log('  ' + t + ': 表不存在');
  }
});

db.close();
" 2>/dev/null || echo "查询失败，可能容器还在启动中"

VERIFY

echo ""
echo "=========================================="
echo "✅ 迁移完成！"
echo "=========================================="
echo ""
echo "📋 后续步骤："
echo "1. 访问 https://api.gambleverify.com/admin 登录后台"
echo "2. 检查 Content Manager 中的数据是否完整"
echo "3. 测试 API 端点: https://api.gambleverify.com/api/platforms"
echo "4. 如有问题，可以从备份恢复:"
echo "   ssh $SERVER"
echo "   cd $PROJECT_PATH"
echo "   docker compose -f deployment/docker-compose.prod.yml run --rm strapi \\"
echo "     sh -c 'cp .tmp/data.db.before-migration-$TIMESTAMP .tmp/data.db'"
echo ""
echo "💾 备份信息："
echo "   本地备份: $LOCAL_DB.backup-$TIMESTAMP"
echo "   服务器备份: .tmp/data.db.before-migration-$TIMESTAMP"
echo ""
