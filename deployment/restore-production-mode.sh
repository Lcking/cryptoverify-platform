#!/bin/bash
# 恢复生产模式
set -e

echo "🔄 恢复生产模式..."
cd /opt/cryptoverify-platform

echo ""
echo "1️⃣  停止开发模式容器..."
docker compose -f deployment/docker-compose.prod.yml stop strapi

echo ""
echo "2️⃣  启动生产模式..."
docker compose -f deployment/docker-compose.prod.yml up -d strapi

echo ""
echo "3️⃣  查看启动日志..."
docker logs --tail 20 cryptoverify-strapi-prod

echo ""
echo "======================================"
echo "✅ 已恢复生产模式"
echo "======================================"
echo ""
echo "验证："
echo "   curl -I https://api.gambleverify.com/admin"
echo "   应该返回 200 OK"
echo "======================================"
