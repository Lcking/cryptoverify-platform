# 🚀 快速部署指南

## 🎯 真正的问题（已通过浏览器诊断确认）

### 症状
- ✅ API 请求已发出
- ✅ 环境变量已注入构建
- ❌ **CORS 错误：Access-Control-Allow-Origin 头包含重复值**

### 根本原因
```
The 'Access-Control-Allow-Origin' header contains multiple values 
'https://app.gambleverify.com, https://app.gambleverify.com', 
but only one is allowed.
```

**问题**：Caddy 和 Strapi 都设置了 CORS 头，导致浏览器收到重复的头，拒绝请求。

## 修复方案
1. ✅ docker-compose 显式声明 `REACT_APP_*` 变量（已完成）
2. ✅ **移除 Caddyfile 中的 CORS 配置，让 Strapi 处理**（新修复）

---

## 📋 执行步骤（3 步）

### 1️⃣ 本地提交（在 Mac 上执行）

```bash
cd /Users/ck/Desktop/Project/cryptoverify-platform

# 提交更改
git add .
git commit -m "fix: 移除 Caddy CORS 配置，避免与 Strapi 重复"
git push origin main
```

### 2️⃣ 服务器部署（SSH 到服务器）

```bash
# SSH 登录
ssh root@167.160.189.182

# 拉取更新并修复
cd /opt/cryptoverify-platform
git pull
chmod +x deployment/fix-cors-duplicate.sh
bash deployment/fix-cors-duplicate.sh
```

脚本只需 10 秒完成（只重启 Caddy，不重新构建）。

### 3️⃣ 验证（在浏览器）

**必须使用无痕模式！**

1. 打开无痕窗口
2. 访问：`https://app.gambleverify.com/cms-debug.html`
3. 点击 "测试 Platforms API" 按钮
4. 应该看到：✓ platforms API: 200

**或者**访问首页并检查 Network 标签：
- 应该看到对 `api.gambleverify.com` 的请求
- 所有请求状态都是 200/204

---

## ✅ 成功标志

- 首页显示真实平台名称（不是 "Mock Platform"）
- Console 无错误
- Network 有 API 请求

---

## 🔧 故障排查

如果还是不工作：

1. **清除浏览器所有缓存**
   - Chrome: Ctrl+Shift+Delete → "全部时间"

2. **检查 Strapi 权限**
   ```bash
   curl https://api.gambleverify.com/api/platforms
   ```
   应该返回数据（不是 403）

3. **查看日志**
   ```bash
   docker logs cryptoverify-frontend-builder --tail 50
   docker logs cryptoverify-caddy --tail 20
   ```

详细说明见：`deployment/CMS_INTEGRATION_FIX.md`
