#!/bin/bash
# 在服务器上执行此脚本查询数据库内容
# 用法: ssh root@162.14.117.49 'bash -s' < query-db-remote.sh

echo "=========================================="
echo "Strapi 数据库内容查询"
echo "=========================================="
echo ""

cd /opt/cryptoverify-platform

# 创建临时查询脚本
cat > /tmp/query-db.js << 'EOF'
const Database = require('better-sqlite3');
const db = new Database('.tmp/data.db', { readonly: true });

console.log('1️⃣  管理员账号');
console.log('--- Admin Users ---');
const adminUsers = db.prepare('SELECT id, email, username, created_at FROM admin_users ORDER BY id').all();
console.log(`总数: ${adminUsers.length} 个\n`);
adminUsers.forEach(user => {
  console.log(`  ID: ${user.id} | Email: ${user.email} | Username: ${user.username || '(未设置)'}`);
  console.log(`  创建时间: ${user.created_at}\n`);
});

console.log('2️⃣  内容类型统计');
console.log('--- Content Types ---');
const tables = ['platforms', 'news', 'insights', 'exposures', 'verifications'];
tables.forEach(table => {
  try {
    const count = db.prepare(`SELECT COUNT(*) as count FROM ${table}`).get();
    console.log(`  ${table}: ${count.count} 条`);
  } catch (err) {
    console.log(`  ${table}: 表不存在`);
  }
});

console.log('\n3️⃣  最近的 Platforms');
console.log('--- Recent Platforms ---');
try {
  const platforms = db.prepare('SELECT id, title, slug, created_at FROM platforms ORDER BY created_at DESC LIMIT 5').all();
  if (platforms.length > 0) {
    platforms.forEach(p => {
      console.log(`  - [${p.id}] ${p.title} (${p.slug})`);
    });
  } else {
    console.log('  (无数据)');
  }
} catch (err) {
  console.log('  查询失败');
}

console.log('\n4️⃣  API Tokens');
try {
  const tokens = db.prepare('SELECT id, name, type, created_at FROM strapi_api_tokens').all();
  console.log(`总数: ${tokens.length} 个`);
  tokens.forEach(t => console.log(`  - [${t.id}] ${t.name} (${t.type})`));
} catch (err) {
  console.log('无 API tokens 或查询失败');
}

db.close();
console.log('\n==========================================');
EOF

# 在容器内执行查询
echo "正在查询数据库..."
docker exec cryptoverify-strapi-prod node /tmp/query-db.js

echo ""
echo "✅ 查询完成！"
