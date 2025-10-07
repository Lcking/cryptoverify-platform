# 🚀 快速部署指南

## 问题摘要
1. ❌ 环境变量未注入构建 → React 使用默认值（空字符串）
2. ❌ CORS 配置顺序错误 → OPTIONS 请求无 CORS 头

## 修复方案
1. ✅ docker-compose 显式声明 `REACT_APP_*` 变量
2. ✅ Caddyfile 调整 `header` 指令到 `respond` 之前

---

## 📋 执行步骤（3 步）

### 1️⃣ 本地提交（在 Mac 上执行）

```bash
cd /Users/ck/Desktop/Project/cryptoverify-platform

# 提交更改
git add .
git commit -m "fix: 环境变量注入和 CORS 配置"
git push origin main
```

### 2️⃣ 服务器部署（SSH 到服务器）

```bash
# SSH 登录
ssh root@167.160.189.182

# 拉取更新
cd /opt/cryptoverify-platform
git pull

# 运行修复脚本
chmod +x deployment/fix-cms-final.sh
bash deployment/fix-cms-final.sh
```

脚本会自动完成所有操作，等待 2-3 分钟。

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
