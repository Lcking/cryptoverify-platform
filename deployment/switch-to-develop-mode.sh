#!/bin/bash
# 临时切换生产 Strapi 为开发模式
# ⚠️  警告：仅用于紧急修改内容类型，修改完立即切回生产模式

set -e

echo "⚠️  警告：即将切换生产环境为开发模式"
echo "这将允许修改内容类型，但性能会降低"
echo ""
read -p "确认继续？(yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "已取消"
    exit 0
fi

cd /opt/cryptoverify-platform

echo ""
echo "1️⃣  停止当前容器..."
docker compose -f deployment/docker-compose.prod.yml stop strapi

echo ""
echo "2️⃣  备份数据库..."
BACKUP_FILE="backend/.tmp/data.db.backup-$(date +%Y%m%d-%H%M%S)"
cp backend/.tmp/data.db "$BACKUP_FILE"
echo "   ✅ 备份到: $BACKUP_FILE"

echo ""
echo "3️⃣  切换为开发模式..."
# 临时修改 docker-compose，使用 npm run develop
docker compose -f deployment/docker-compose.prod.yml run --rm \
  -e NODE_ENV=development \
  strapi sh -c "npm run develop"

echo ""
echo "======================================"
echo "✅ 已启动开发模式"
echo "======================================"
echo ""
echo "现在可以访问后台修改内容类型"
echo "修改完成后，按 Ctrl+C 停止"
echo ""
echo "然后运行恢复脚本："
echo "   bash deployment/restore-production-mode.sh"
echo "======================================"
