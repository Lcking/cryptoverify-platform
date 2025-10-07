#!/usr/bin/env node
/**
 * Strapi 数据库查询脚本
 * 使用 better-sqlite3 查询数据库内容
 */

const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = process.argv[2] || '.tmp/data.db';

console.log('==========================================');
console.log('Strapi 数据库内容查询');
console.log('==========================================\n');

try {
  const db = new Database(DB_PATH, { readonly: true });
  
  // 1. 管理员账号
  console.log('1️⃣  管理员账号');
  console.log('--- Admin Users ---');
  const adminUsers = db.prepare(`
    SELECT id, email, username, created_at, updated_at 
    FROM admin_users 
    ORDER BY id
  `).all();
  
  console.log(`总数: ${adminUsers.length} 个\n`);
  adminUsers.forEach(user => {
    console.log(`  ID: ${user.id}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Username: ${user.username || '(未设置)'}`);
    console.log(`  创建时间: ${user.created_at}`);
    console.log(`  更新时间: ${user.updated_at}`);
    console.log('');
  });
  
  // 2. 内容统计
  console.log('2️⃣  内容类型统计');
  console.log('--- Content Types ---');
  
  const contentTypes = [
    { table: 'platforms', name: 'Platforms' },
    { table: 'news', name: 'News' },
    { table: 'insights', name: 'Insights' },
    { table: 'exposures', name: 'Exposures' },
    { table: 'verifications', name: 'Verifications' }
  ];
  
  contentTypes.forEach(({ table, name }) => {
    try {
      const count = db.prepare(`SELECT COUNT(*) as count FROM ${table}`).get();
      console.log(`  ${name}: ${count.count} 条`);
    } catch (err) {
      console.log(`  ${name}: 表不存在或查询失败`);
    }
  });
  console.log('');
  
  // 3. 最近的内容
  console.log('3️⃣  最近创建的内容');
  console.log('--- Recent Platforms ---');
  try {
    const platforms = db.prepare(`
      SELECT id, title, slug, created_at 
      FROM platforms 
      ORDER BY created_at DESC 
      LIMIT 5
    `).all();
    
    if (platforms.length > 0) {
      platforms.forEach(p => {
        console.log(`  - [${p.id}] ${p.title} (${p.slug})`);
        console.log(`    创建时间: ${p.created_at}`);
      });
    } else {
      console.log('  (无数据)');
    }
  } catch (err) {
    console.log('  查询失败');
  }
  console.log('');
  
  // 4. API Tokens
  console.log('4️⃣  API Tokens');
  console.log('--- API Tokens ---');
  try {
    const tokens = db.prepare(`
      SELECT id, name, description, type, created_at 
      FROM strapi_api_tokens 
      ORDER BY created_at DESC
    `).all();
    
    console.log(`总数: ${tokens.length} 个\n`);
    if (tokens.length > 0) {
      tokens.forEach(token => {
        console.log(`  - [${token.id}] ${token.name}`);
        console.log(`    类型: ${token.type}`);
        console.log(`    描述: ${token.description || '(无)'}`);
        console.log(`    创建时间: ${token.created_at}`);
        console.log('');
      });
    }
  } catch (err) {
    console.log('  查询失败或表不存在\n');
  }
  
  // 5. 数据库统计
  console.log('5️⃣  数据库统计');
  console.log('--- Database Info ---');
  try {
    const tables = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' 
      AND name NOT LIKE 'sqlite_%'
      ORDER BY name
    `).all();
    
    console.log(`  总表数: ${tables.length}`);
    console.log('  主要表:');
    tables.slice(0, 20).forEach(t => {
      try {
        const count = db.prepare(`SELECT COUNT(*) as count FROM ${t.name}`).get();
        console.log(`    - ${t.name}: ${count.count} 行`);
      } catch (err) {
        console.log(`    - ${t.name}: (查询失败)`);
      }
    });
    
    if (tables.length > 20) {
      console.log(`    ... 还有 ${tables.length - 20} 个表`);
    }
  } catch (err) {
    console.log('  统计失败');
  }
  
  db.close();
  
  console.log('\n==========================================');
  console.log('查询完成！');
  console.log('==========================================\n');
  
} catch (error) {
  console.error('❌ 错误:', error.message);
  process.exit(1);
}
