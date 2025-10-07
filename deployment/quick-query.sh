#!/bin/bash
# 快速查询脚本 - 在本地执行

ssh root@162.14.117.49 << 'ENDSSH'
cd /opt/cryptoverify-platform
docker exec cryptoverify-strapi-prod node -e "
const db = require('better-sqlite3')('.tmp/data.db', { readonly: true });

console.log('\n========================================');
console.log('Strapi 数据库内容查询');
console.log('========================================\n');

console.log('1️⃣  管理员账号');
console.log('===================');
const admins = db.prepare('SELECT id, email, username, created_at FROM admin_users').all();
console.log('总数:', admins.length, '个\n');
admins.forEach(u => {
  console.log('  ID:', u.id);
  console.log('  Email:', u.email);
  console.log('  Username:', u.username || '(未设置)');
  console.log('  创建时间:', u.created_at);
  console.log('');
});

console.log('2️⃣  内容统计');
console.log('===================');
['platforms', 'news', 'insights', 'exposures', 'verifications'].forEach(t => {
  try {
    const c = db.prepare(\`SELECT COUNT(*) as count FROM \${t}\`).get();
    console.log(\`  \${t}: \${c.count} 条\`);
  } catch (e) { 
    console.log(\`  \${t}: 表不存在或无权限\`); 
  }
});

console.log('\n3️⃣  最近创建的 Platforms');
console.log('===================');
try {
  const p = db.prepare('SELECT id, title, slug, created_at FROM platforms ORDER BY created_at DESC LIMIT 5').all();
  if (p.length > 0) {
    p.forEach(x => {
      console.log(\`  [\${x.id}] \${x.title}\`);
      console.log(\`      Slug: \${x.slug}\`);
      console.log(\`      创建: \${x.created_at}\`);
      console.log('');
    });
  } else {
    console.log('  (无数据)');
  }
} catch (e) { 
  console.log('  查询失败:', e.message); 
}

console.log('\n4️⃣  API Tokens');
console.log('===================');
try {
  const t = db.prepare('SELECT id, name, type, created_at FROM strapi_api_tokens').all();
  console.log('总数:', t.length, '个\n');
  if (t.length > 0) {
    t.forEach(x => {
      console.log(\`  [\${x.id}] \${x.name}\`);
      console.log(\`      类型: \${x.type}\`);
      console.log(\`      创建: \${x.created_at}\`);
      console.log('');
    });
  }
} catch (e) { 
  console.log('  无 API tokens 或查询失败\n'); 
}

console.log('5️⃣  数据库表统计');
console.log('===================');
try {
  const tables = db.prepare('SELECT name FROM sqlite_master WHERE type=\"table\" AND name NOT LIKE \"sqlite_%\" ORDER BY name').all();
  console.log('总表数:', tables.length, '\n');
  console.log('主要内容表:');
  tables.filter(t => ['platforms', 'news', 'insights', 'exposures', 'verifications', 'admin_users', 'strapi_api_tokens'].includes(t.name))
    .forEach(t => console.log('  -', t.name));
} catch (e) {
  console.log('统计失败');
}

db.close();
console.log('\n========================================');
console.log('查询完成！');
console.log('========================================\n');
"
ENDSSH
