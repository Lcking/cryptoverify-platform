#!/bin/bash
# Strapi 数据持久化诊断脚本
# 使用方法：在服务器上执行 bash diagnose-data.sh

set -e

echo "=========================================="
echo "Strapi 数据持久化诊断报告"
echo "生成时间: $(date)"
echo "=========================================="
echo ""

# 1. 检查容器是否运行
echo "1️⃣  检查容器状态..."
if docker ps | grep -q cryptoverify-strapi-prod; then
    echo "✅ Strapi 容器正在运行"
    CONTAINER_ID=$(docker ps -q -f name=cryptoverify-strapi-prod)
    echo "   容器 ID: $CONTAINER_ID"
else
    echo "❌ Strapi 容器未运行"
    exit 1
fi
echo ""

# 2. 检查容器内数据库文件
echo "2️⃣  检查容器内数据库文件..."
echo "--- 文件列表 ---"
docker exec cryptoverify-strapi-prod ls -lah .tmp/ 2>/dev/null || echo "无法访问 .tmp 目录"
echo ""

if docker exec cryptoverify-strapi-prod test -f .tmp/data.db; then
    echo "✅ 找到数据库文件: .tmp/data.db"
    
    # 文件大小
    DB_SIZE=$(docker exec cryptoverify-strapi-prod du -h .tmp/data.db | cut -f1)
    echo "   文件大小: $DB_SIZE"
    
    # 修改时间
    DB_MTIME=$(docker exec cryptoverify-strapi-prod stat -c '%y' .tmp/data.db 2>/dev/null || docker exec cryptoverify-strapi-prod stat -f '%Sm' .tmp/data.db 2>/dev/null)
    echo "   修改时间: $DB_MTIME"
else
    echo "❌ 未找到数据库文件 .tmp/data.db"
fi
echo ""

# 3. 检查 Docker Volume
echo "3️⃣  检查 Docker Volume 配置..."
VOLUME_NAME="deployment_strapi_db"
if docker volume ls | grep -q "$VOLUME_NAME"; then
    echo "✅ Volume 存在: $VOLUME_NAME"
    
    # Volume 详细信息
    echo "--- Volume 信息 ---"
    docker volume inspect "$VOLUME_NAME" --format '{{.Mountpoint}}' | while read MOUNTPOINT; do
        echo "   挂载点: $MOUNTPOINT"
        
        # 检查宿主机上的文件
        if [ -d "$MOUNTPOINT" ]; then
            echo "   宿主机目录内容:"
            ls -lah "$MOUNTPOINT" 2>/dev/null || echo "   (无法访问)"
            
            if [ -f "$MOUNTPOINT/data.db" ]; then
                HOST_DB_SIZE=$(du -h "$MOUNTPOINT/data.db" | cut -f1)
                HOST_DB_MTIME=$(stat -c '%y' "$MOUNTPOINT/data.db" 2>/dev/null || stat -f '%Sm' "$MOUNTPOINT/data.db" 2>/dev/null)
                echo "   宿主机 data.db 大小: $HOST_DB_SIZE"
                echo "   宿主机 data.db 修改时间: $HOST_DB_MTIME"
            fi
        fi
    done
else
    echo "⚠️  Volume 不存在: $VOLUME_NAME"
    echo "   尝试查找其他可能的 volume..."
    docker volume ls | grep strapi
fi
echo ""

# 4. 检查 docker-compose 配置
echo "4️⃣  检查 docker-compose.prod.yml 配置..."
if [ -f /opt/cryptoverify-platform/deployment/docker-compose.prod.yml ]; then
    echo "--- Volume 挂载配置 ---"
    grep -A 2 "strapi_db:" /opt/cryptoverify-platform/deployment/docker-compose.prod.yml || echo "(未找到配置)"
    echo ""
    echo "--- 容器 volumes 配置 ---"
    grep -A 3 "volumes:" /opt/cryptoverify-platform/deployment/docker-compose.prod.yml | head -10
else
    echo "⚠️  未找到 docker-compose.prod.yml"
fi
echo ""

# 5. 查询数据库内容（简单统计）
echo "5️⃣  查询数据库内容统计..."
if docker exec cryptoverify-strapi-prod test -f .tmp/data.db; then
    echo "--- 管理员账号数量 ---"
    ADMIN_COUNT=$(docker exec cryptoverify-strapi-prod sqlite3 .tmp/data.db "SELECT COUNT(*) FROM admin_users;" 2>/dev/null || echo "查询失败")
    echo "   管理员账号: $ADMIN_COUNT 个"
    
    echo "--- 内容类型统计 ---"
    PLATFORMS=$(docker exec cryptoverify-strapi-prod sqlite3 .tmp/data.db "SELECT COUNT(*) FROM platforms;" 2>/dev/null || echo "0")
    NEWS=$(docker exec cryptoverify-strapi-prod sqlite3 .tmp/data.db "SELECT COUNT(*) FROM news;" 2>/dev/null || echo "0")
    INSIGHTS=$(docker exec cryptoverify-strapi-prod sqlite3 .tmp/data.db "SELECT COUNT(*) FROM insights;" 2>/dev/null || echo "0")
    EXPOSURES=$(docker exec cryptoverify-strapi-prod sqlite3 .tmp/data.db "SELECT COUNT(*) FROM exposures;" 2>/dev/null || echo "0")
    
    echo "   Platforms: $PLATFORMS 条"
    echo "   News: $NEWS 条"
    echo "   Insights: $INSIGHTS 条"
    echo "   Exposures: $EXPOSURES 条"
    
    echo "--- 最近管理员登录 ---"
    docker exec cryptoverify-strapi-prod sqlite3 .tmp/data.db \
        "SELECT email, username, created_at FROM admin_users LIMIT 5;" 2>/dev/null || echo "(查询失败)"
else
    echo "❌ 无数据库文件，跳过查询"
fi
echo ""

# 6. 检查备份文件
echo "6️⃣  检查备份文件..."
BACKUP_COUNT=$(docker exec cryptoverify-strapi-prod sh -c 'ls -1 .tmp/data.db.backup-* 2>/dev/null | wc -l' || echo "0")
echo "   找到 $BACKUP_COUNT 个备份文件"
if [ "$BACKUP_COUNT" -gt 0 ]; then
    echo "--- 备份列表 ---"
    docker exec cryptoverify-strapi-prod ls -lh .tmp/data.db.backup-* 2>/dev/null || true
fi
echo ""

echo "=========================================="
echo "诊断完成！"
echo "=========================================="
echo ""
echo "💡 建议："
echo "1. 如果数据库文件很小（< 100KB），可能是空数据库或数据丢失"
echo "2. 检查修改时间是否符合预期（是否在最近容器重启后被重置）"
echo "3. 如果宿主机和容器内文件大小不一致，可能是挂载问题"
echo "4. 如果有备份文件，可以使用备份恢复数据"
