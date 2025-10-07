# Strapi 数据库快速查询命令

## 方式 1：一键查询（推荐）

在**本地终端**执行以下命令，它会在服务器上查询数据库并显示结果：

```bash
ssh root@162.14.117.49 << 'ENDSSH'
cd /opt/cryptoverify-platform
docker exec cryptoverify-strapi-prod node -e "
const db = require('better-sqlite3')('.tmp/data.db', { readonly: true });

console.log('\n=== 管理员账号 ===');
const admins = db.prepare('SELECT id, email, username, created_at FROM admin_users').all();
console.log('总数:', admins.length);
admins.forEach(u => console.log(\`  [\${u.id}] \${u.email} | \${u.username || '(未设置)'}\`));

console.log('\n=== 内容统计 ===');
['platforms', 'news', 'insights', 'exposures', 'verifications'].forEach(t => {
  try {
    const c = db.prepare(\`SELECT COUNT(*) as count FROM \${t}\`).get();
    console.log(\`  \${t}: \${c.count} 条\`);
  } catch (e) { console.log(\`  \${t}: 表不存在\`); }
});

console.log('\n=== 最近 Platforms (前5条) ===');
try {
  const p = db.prepare('SELECT id, title, slug FROM platforms ORDER BY created_at DESC LIMIT 5').all();
  p.forEach(x => console.log(\`  [\${x.id}] \${x.title}\`));
  if (p.length === 0) console.log('  (无数据)');
} catch (e) { console.log('  查询失败'); }

console.log('\n=== API Tokens ===');
try {
  const t = db.prepare('SELECT id, name, type FROM strapi_api_tokens').all();
  console.log('总数:', t.length);
  t.forEach(x => console.log(\`  [\${x.id}] \${x.name} (\${x.type})\`));
} catch (e) { console.log('  无 tokens'); }

db.close();
console.log('');
"
ENDSSH
```

---

## 方式 2：分步查询

### 查询管理员账号
```bash
ssh root@162.14.117.49 "docker exec cryptoverify-strapi-prod node -e \"
const db = require('better-sqlite3')('.tmp/data.db', { readonly: true });
const users = db.prepare('SELECT id, email, username FROM admin_users').all();
console.log('管理员账号:', users.length, '个');
users.forEach(u => console.log('  -', u.email, '|', u.username));
db.close();
\""
```

### 查询内容数量
```bash
ssh root@162.14.117.49 "docker exec cryptoverify-strapi-prod node -e \"
const db = require('better-sqlite3')('.tmp/data.db', { readonly: true });
['platforms', 'news', 'insights', 'exposures'].forEach(table => {
  try {
    const count = db.prepare(\\\`SELECT COUNT(*) as count FROM \\\${table}\\\`).get();
    console.log(table + ':', count.count);
  } catch (e) {}
});
db.close();
\""
```

### 查询 Platforms 列表
```bash
ssh root@162.14.117.49 "docker exec cryptoverify-strapi-prod node -e \"
const db = require('better-sqlite3')('.tmp/data.db', { readonly: true });
const platforms = db.prepare('SELECT id, title, slug FROM platforms LIMIT 10').all();
platforms.forEach(p => console.log(\\\`[\\\${p.id}] \\\${p.title} (\\\${p.slug})\\\`));
db.close();
\""
```

---

## 方式 3：使用备用查询脚本

如果上面的命令遇到转义问题，可以使用脚本文件：

```bash
# 1. 上传查询脚本
cd /path/to/cryptoverify-platform/deployment
scp query-db-remote.sh root@162.14.117.49:/tmp/

# 2. 执行
ssh root@162.14.117.49 'bash /tmp/query-db-remote.sh'
```

---

## 方式 4：直接在服务器上执行

```bash
# SSH 到服务器
ssh root@162.14.117.49

# 执行查询
cd /opt/cryptoverify-platform
docker exec cryptoverify-strapi-prod node -e "
const db = require('better-sqlite3')('.tmp/data.db', { readonly: true });
console.log('管理员:', db.prepare('SELECT COUNT(*) FROM admin_users').get());
console.log('Platforms:', db.prepare('SELECT COUNT(*) FROM platforms').get());
db.close();
"
```

---

## 常见查询

### 查看所有表名
```bash
ssh root@162.14.117.49 "docker exec cryptoverify-strapi-prod node -e \"
const db = require('better-sqlite3')('.tmp/data.db', { readonly: true });
const tables = db.prepare('SELECT name FROM sqlite_master WHERE type=\\\"table\\\" ORDER BY name').all();
tables.forEach(t => console.log(t.name));
db.close();
\""
```

### 查看特定 Platform 详情
```bash
ssh root@162.14.117.49 "docker exec cryptoverify-strapi-prod node -e \"
const db = require('better-sqlite3')('.tmp/data.db', { readonly: true });
const p = db.prepare('SELECT * FROM platforms WHERE id = 1').get();
console.log(JSON.stringify(p, null, 2));
db.close();
\""
```

### 删除所有 API Tokens
```bash
ssh root@162.14.117.49 "docker exec cryptoverify-strapi-prod node -e \"
const db = require('better-sqlite3')('.tmp/data.db');
db.prepare('DELETE FROM strapi_api_tokens').run();
console.log('已删除所有 API tokens');
db.close();
\""
```

---

## 故障排查

### 如果提示 "better-sqlite3" not found
说明 Strapi 没有安装 better-sqlite3，可以尝试：

```bash
ssh root@162.14.117.49
docker exec -it cryptoverify-strapi-prod bash
cd /srv/app
npm list better-sqlite3  # 检查是否安装
npm install better-sqlite3  # 如果没有，安装它
```

### 如果想在宿主机上直接查询
需要安装 sqlite3：

```bash
ssh root@162.14.117.49
apt update && apt install -y sqlite3

# 查询 Volume 中的数据库
MOUNTPOINT=$(docker volume inspect deployment_strapi_db --format '{{.Mountpoint}}')
sqlite3 "$MOUNTPOINT/data.db" "SELECT COUNT(*) FROM admin_users;"
```
