# 前端 CMS 集成问题修复方案

## 🔍 问题分析

### 问题 1：环境变量未注入到构建中
**症状**：
- `grep "api.gambleverify.com" build/static/js/main.*.js` 返回空
- 前端代码中 `ENABLE_CMS` 为 `false`

**原因**：
- `env_file` 在 Docker Compose 中只设置容器环境变量
- Create React App 只在**构建时**读取 `REACT_APP_*` 环境变量并注入到 JS 中
- 如果环境变量没有在构建时可用，就会使用默认值（空字符串或 `undefined`）

**解决方案**：
在 `docker-compose.prod.yml` 中**显式声明**环境变量，而不是只依赖 `env_file`：

```yaml
frontend-builder:
  environment:
    NODE_ENV: production
    REACT_APP_ENABLE_CMS: "true"
    REACT_APP_CMS_URL: "https://api.gambleverify.com"
    # ... 其他变量
```

### 问题 2：CORS 预检请求失败
**症状**：
- 浏览器直接访问 `https://api.gambleverify.com/api/platforms` 正常
- 前端 AJAX 请求显示 `Failed to fetch`
- 浏览器控制台显示 CORS 错误

**原因**：
- 浏览器发送 OPTIONS 预检请求时，Caddy 先执行 `respond @options 204`
- 但此时 `header` 指令还未执行，所以 OPTIONS 响应没有 CORS 头
- 浏览器看到 OPTIONS 响应没有 CORS 头，拒绝发送真正的 GET 请求

**解决方案**：
将 `header` 指令移到 `respond` 之前，确保所有响应（包括 OPTIONS）都有 CORS 头：

```caddy
api.gambleverify.com {
  # 1. 先设置 CORS 头（应用到所有请求）
  header {
    Access-Control-Allow-Origin "https://app.gambleverify.com"
    # ...
  }
  
  # 2. 然后处理 OPTIONS（已经有 CORS 头了）
  @options method OPTIONS
  respond @options 204
  
  # 3. 最后代理其他请求
  reverse_proxy strapi:1337 { ... }
}
```

---

## 🛠️ 修复步骤

### 步骤 1：本地测试（可选但推荐）

运行本地测试脚本验证环境变量注入：

```bash
cd /Users/ck/Desktop/Project/cryptoverify-platform
chmod +x test-build-local.sh
./test-build-local.sh
```

**预期输出**：
```
✅ 找到 5 处 'api.gambleverify.com'
```

如果看到这个，说明环境变量注入成功。

### 步骤 2：提交更改

```bash
cd /Users/ck/Desktop/Project/cryptoverify-platform
git add .
git commit -m "fix: 修复环境变量注入和 CORS 配置

- docker-compose.prod.yml: 显式声明 REACT_APP_* 环境变量
- Caddyfile: 调整 header 指令顺序，确保 OPTIONS 请求有 CORS 头
- 添加 fix-cms-final.sh: 完整的诊断和修复脚本
- 添加 test-build-local.sh: 本地构建测试脚本"

git push origin main
```

### 步骤 3：服务器部署

SSH 到服务器：

```bash
ssh root@167.160.189.182
```

执行修复脚本：

```bash
cd /opt/cryptoverify-platform
git pull
chmod +x deployment/fix-cms-final.sh
bash deployment/fix-cms-final.sh
```

脚本会自动：
1. ✅ 诊断当前配置
2. ✅ 测试 CORS 设置
3. ✅ 清理旧构建
4. ✅ 重新构建前端（环境变量注入）
5. ✅ 验证构建产物
6. ✅ 重启 Caddy
7. ✅ 最终验证

### 步骤 4：浏览器验证

**重要**：必须使用无痕模式避免缓存！

#### 方法 A：使用诊断页面（推荐）

1. 打开无痕浏览器窗口
2. 访问：`https://app.gambleverify.com/cms-debug.html`
3. 点击 "测试 Platforms API" 按钮
4. 应该看到 `✓ platforms API: 200`

#### 方法 B：开发者工具

1. 打开无痕浏览器窗口
2. 按 F12 打开开发者工具
3. 切换到 **Network** 标签
4. 访问：`https://app.gambleverify.com`
5. 在 Network 筛选框输入：`api.gambleverify.com`
6. 应该看到：
   - ✅ `OPTIONS /api/platforms` - Status: 204
   - ✅ `GET /api/platforms` - Status: 200
   - ✅ `OPTIONS /api/news` - Status: 204
   - ✅ `GET /api/news` - Status: 200
   - ✅ `OPTIONS /api/insights` - Status: 204
   - ✅ `GET /api/insights` - Status: 200

7. 检查响应头（点击任意请求）：
   - 应该有 `access-control-allow-origin: https://app.gambleverify.com`

#### 方法 C：Console 检查

在开发者工具的 **Console** 标签：

```javascript
// 检查环境变量是否正确注入
// 如果前端代码有导出配置，可以这样查看
console.log(window.location.origin)

// 手动测试 fetch
fetch('https://api.gambleverify.com/api/platforms', {
  method: 'GET',
  headers: { 'Accept': 'application/json' }
})
.then(r => r.json())
.then(d => console.log('Success:', d.data.length, 'platforms'))
.catch(e => console.error('Failed:', e))
```

应该看到：`Success: 3 platforms`（或你实际的数据条数）

---

## 🧪 验证清单

- [ ] 本地测试构建包含 `api.gambleverify.com`
- [ ] 服务器构建包含 `api.gambleverify.com`
- [ ] OPTIONS 请求返回 204 且有 CORS 头
- [ ] GET 请求返回 200 且有 CORS 头
- [ ] 无痕浏览器访问首页，Network 显示 API 请求
- [ ] 首页显示 CMS 数据（不是 mock 数据）
- [ ] Console 无 CORS 错误

---

## 🚨 如果还是不工作

### 1. 检查 Strapi Public 权限

```bash
ssh root@167.160.189.182
cd /opt/cryptoverify-platform
docker exec cryptoverify-strapi-prod node -e "
const db = require('better-sqlite3')('.tmp/data.db', { readonly: true });
const query = 'SELECT * FROM up_permissions WHERE role = 2 LIMIT 5';
const rows = db.prepare(query).all();
console.log(JSON.stringify(rows, null, 2));
db.close();
"
```

如果输出为空，需要在 Strapi 后台设置权限：
1. 访问 `https://api.gambleverify.com/admin`
2. Settings → Users & Permissions → Roles → Public
3. 为所有内容类型启用 `find` 和 `findOne`
4. Save

### 2. 检查防火墙

```bash
# 在服务器上
curl -I https://api.gambleverify.com/api/platforms
```

应该返回 200。

### 3. 清除浏览器所有缓存

Chrome:
- Ctrl+Shift+Delete
- 选择 "全部时间"
- 勾选 "缓存的图片和文件"
- 清除数据

Safari:
- Safari → 清除历史记录
- 选择 "所有历史记录"

Firefox:
- Ctrl+Shift+Delete
- 选择 "全部"
- 勾选 "缓存"

### 4. 查看完整日志

```bash
# Caddy 日志
docker logs cryptoverify-caddy --tail 50

# Frontend 构建日志
docker logs cryptoverify-frontend-builder --tail 100

# Strapi 日志
docker logs cryptoverify-strapi-prod --tail 50
```

---

## 📚 技术说明

### 为什么浏览器能访问但前端不能？

1. **直接访问**：浏览器导航到 URL，没有 CORS 限制
2. **AJAX 请求**：JavaScript 发起跨域请求，浏览器强制执行 CORS 策略

### Create React App 环境变量机制

CRA 在**构建时**（`npm run build`）：
1. 读取所有 `REACT_APP_*` 环境变量
2. 替换代码中的 `process.env.REACT_APP_XXX`
3. 生成静态 JS 文件（变量值已硬编码）

**运行时**无法改变这些值！

### Docker Compose env_file vs environment

- `env_file`: 从文件加载环境变量到容器
- `environment`: 直接在 compose 文件中声明变量

两者都可以工作，但 `environment` 更明确，不依赖外部文件。

---

## ✅ 完成标志

当你看到以下内容时，说明完全修复成功：

1. ✅ 首页不再显示 "Mock Platform 1/2/3"
2. ✅ 显示真实的平台名称（如 Binance, Kraken, Coinbase）
3. ✅ Network 标签显示对 api.gambleverify.com 的成功请求
4. ✅ Console 无错误信息
5. ✅ 诊断页面所有测试通过

恭喜！🎉
