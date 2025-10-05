# Agent Work Log (方案A：Docker 构建 Strapi)

本文件记录本次后端对接与前端改造的任务、问题、解决方案、Bug 修复与代码评审要点。每个任务按 开发 → 测试 → 验收 流程记录，完成后标记为「已验收」。

## 任务模板
- 编号：TASK-XXX
- 描述：
- 开发：
- 测试：
- 验收：
- 问题与解决：
- Bug 修复记录：
- 代码审核意见：

---

## TASK-001 创建 agentwork.md 并记录任务框架（已验收）
- 描述：创建本工作记录文件，制定模板与任务追踪方式。
- 开发：新增 `agentwork.md`，初始化任务模板与列表。
- 测试：文件存在且内容清晰；后续任务可持续追加记录。
- 验收：文件已创建并纳入版本控制，模板明确，可持续记录。
- 问题与解决：无。
- Bug 修复记录：无。
- 代码审核意见：文档应简洁明了，按迭代滚动记录。

## TASK-002 准备后端 Docker 部署基线（进行中）
- 描述：确保 `docker-compose.yml` 可直接用于本地初始化 Strapi；强调 `backend/` 需为空；文档指引如何首次启动与创建管理员账号。
- 开发：复核现有 `docker-compose.yml`；在《README-STRAPI.md》补充 Docker 使用段（已添加）。
- 测试：本地执行 `docker compose up -d` 后可访问 http://localhost:1337。
- 验收：访问成功并能创建管理员账号。
- 问题与解决：Docker 未安装时的替代方案（npx 本地初始化）。
- Bug 修复记录：无。
- 代码审核意见：compose 中挂载卷到 `./backend`，便于持久化与后续开发。

最新进展：确认 backend 目录需要保持空；现有环境下残留 `.env.example` 需删除，已计划清理。
执行结果：已删除 `backend/.env.example`，当前 `backend/` 目录为空，可用于后续初始化。

## TASK-003 前端对接 CMS：Exposure 列表（进行中）
- 描述：为暴露/曝光列表从 Strapi 读取数据（CMS 优先，失败回退 mock）。
- 开发：新增 `fetchExposures`/`fetchExposureBySlug`；改造 `ExposurePage.js` 使用新 API，并保留筛选/分页逻辑。
- 测试：
  - CMS 可访问时展示真实数据；不可访问时仍显示 mock。
  - 筛选、加载更多行为正常。
- 验收：页面功能正常，无报错；网络失败有 graceful 回退。
- 问题与解决：CORS 或鉴权异常；通过中间件与角色权限设置解决。
- Bug 修复记录：待实施中记录。
- 代码审核意见：避免在组件内散落 API URL，集中在 cmsClient；错误处理返回统一结构。

最新进展：
- cmsClient 新增 `fetchExposures`/`fetchExposureBySlug` 并加入 normalize，字段与前端预期保持一致（slug/platform/type/severity/status/reportedDate/summary/evidence/riskFactors/reporterCount/lastUpdate）。
- ExposurePage 接入 CMS，失败回退 mock，保留筛选与分页体验。
 - 命名冲突处理：Strapi 不允许某些保留字段名作为自定义字段（例如 `status` 在部分上下文会被提示风险）。后台字段改用 `caseStatus` 或 `exposureStatus`；前端 normalize 逻辑已支持优先读取 `caseStatus`/`exposureStatus`，否则回退 `status`。

## TASK-004 前端对接 CMS：Verifications 列表（进行中）
- 描述：为验证记录列表从 Strapi 读取数据（CMS 优先，失败回退 mock）。
- 开发：新增 `fetchVerifications`/`fetchVerificationBySlug`；改造 `VerificationsPage.js` 使用新 API。
- 测试：CMS 正常与失败场景；过滤（按平台）正常；时间倒序。
- 验收：功能正确且有回退。
- 问题与解决：同上。
- Bug 修复记录：待实施中记录。
- 代码审核意见：复用 cmsClient 的 withQuery 与 request，统一分页与错误返回。

最新进展：
- cmsClient 新增 `fetchVerifications`/`fetchVerificationBySlug` 并 normalize（slug/title/publishedAt/platformSlug）。
- VerificationsPage 接入 CMS 与回退逻辑，保留平台过滤与时间排序。
 - 命名冲突处理：`publishedAt` 为 Strapi Draft & Publish 内建字段，不应自建同名字段。若业务需要单独的“核验时间”，建议后台使用 `verifiedAt` 或 `releasedAt`；前端 normalize 已回退支持。

## TASK-005 记录与验收本次改动（未开始）
- 描述：本次迭代收尾，补全任务条目中的测试与验收结论。
- 开发：更新各 TASK 的状态与结论。
- 测试：全部条目都有清晰记录。
- 验收：全部打上「已验收」。
- 问题与解决：归档在本节。
- Bug 修复记录：归档在本节。
- 代码审核意见：归档在本节。

## TASK-006 修复 Strapi 启动与访问问题（已验收）
- 描述：容器启动后无法访问或日志异常。修复 compose 镜像/平台与 Node 版本不匹配，确保 /admin 可访问，并验证自定义路由。
- 开发：
  - 将 docker-compose 切换为 `node:20`（Debian），通过 `npm run develop` 启动。
  - 清理并重装依赖，修复 better-sqlite3 在 Alpine/musl 的二进制不兼容问题。
  - 更新 `config/middlewares.ts`，配置 CORS/安全策略允许本地前端来源。
  - 新增 `/api/search` 路由与控制器，合并返回 platforms/news/exposure/verifications。
- 测试：
  - `curl -I http://localhost:1337/admin` → 200 OK。
  - `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:1337/api/search?q=test` → 200。
- 验收：后台可登录，搜索路由可访问，任务通过。
- 问题与解决：
  - Apple Silicon 与镜像平台不匹配 → 改用 Debian Node 运行后端以便编译原生模块。
  - 跟随日志无新输出看似“卡住” → 正常现象，服务空闲时无新日志；建议只在需要时短时查看。
- 代码审核意见：建议后续生产使用 Postgres，并配置对象存储上传；compose 可分离 Nginx/Caddy 与证书获取。

## TASK-007 首页文案与入口修正（已验收）
- 描述：将首页非 CMS 文案集中管理；替换 crypto/cryptocurrency 用语为符合定位的 gamble；修复 Real-time Verification 图标；修正 Learn More 跳转。
- 开发：
  - 新增 `siteContent.features` 配置，集中首页三项服务文案与链接。
  - `FeaturesSection` 改用 `siteContent`，Learn More 使用 `<Link>` 指向 `/platforms` `/verifications` `/exposure`。
  - `ValuesSection` 与 `Footer` 统一用词；“Assets Protected” 图标改为 `fa-shield-halved`。
- 测试：本地与线上预览首页，文案/图标/跳转符合预期。
- 验收：已通过。
- 问题与解决：无。
- Bug 修复记录：bug001、bug003。
- 代码审核意见：非 CMS 文案优先集中在 `siteContent.js`，便于后续统一替换与多语言扩展。

## TASK-008 实时信息板块对接 CMS（进行中）
- 描述：ContentTabs 优先读取 CMS 的 news/insights/exposure/verifications 数据，失败回退 mock；“View More …” 链接对应栏目。
- 开发：
  - 在 `ContentTabs` 中接入 `cmsClient` 的 `fetchNews/fetchInsights/fetchExposures/fetchVerifications`；保持初始 mock 与失败回退。
  - 将底部“View More …” 改为 `<Link>`，分别跳转至 `/news` `/verifications` `/insights` `/exposure`。
- 测试：本地启用 CMS 后可展示真实数据，网络失败时展示 mock。
- 验收：待线上数据打通后确认。
- 问题与解决：依赖 bug004 的前端构建环境变量与 Public 权限放开。
- Bug 修复记录：bug002。

## TASK-009 生产环境数据打通（未开始）
- 描述：前端注入 REACT_APP_*，重建并发布；Strapi Public 角色放开只读接口与 /api/search。
- 开发/运维：
  - 设置 `REACT_APP_ENABLE_CMS=true`、`REACT_APP_CMS_URL=https://api.gambleverify.com`；重建前端产物并替换 Caddy 静态目录。
  - Strapi 后台设置 Public 角色权限：platforms/news/insights/exposures/verifications 的 find/findOne、自定义 /api/search。
- 测试：线上页面能显示 CMS 数据，Network 中 CMS 请求 200 且返回非空。
- 验收：待执行。
- 问题与解决：如碰到 CORS 问题，核对 `backend/config/middlewares.ts` 与 Caddy 的 CORS header、Origin。
- Bug 修复记录：bug004。

## TASK-010 生产 CMS 登录/注册说明（未开始）
- 描述：说明生产管理员与本地不同步，何时显示注册/登录，如何找回或重置密码。
- 开发：在部署文档中追加“生产管理员”章节与重置流程。
- 测试：N/A。
- 验收：待文档更新。
- 问题与解决：无。
- Bug 修复记录：bug005。

## TASK-011 邮件订阅功能（未开始）
- 描述：后端新增 subscribers（email + createdAt + ip）；前端 Footer 表单提交，成功/失败提示，最小防刷。
- 开发：
  - 后端：内容类型或自定义控制器/路由 `/api/subscribe`（POST）。
  - 前端：Footer 表单 onSubmit 校验 email，fetch 提交，loading/成功/错误反馈。
- 测试：输入合法/不合法邮箱；重复提交速率限制；接口异常回退提示。
- 验收：待实现。
- 问题与解决：生产长期方案可扩展到外部邮件服务（Mailgun/SES）。
- Bug 修复记录：backlog001。

## TASK-012 生产后台登录 500（Secure Cookie/代理头）排查（进行中）
- 描述：线上 https://api.gambleverify.com/admin 登录提交后返回 500；日志显示 `Failed to create admin refresh session Cannot send secure cookie over unencrypted connection`。
- 根因：反向代理未正确传递 HTTPS 协议（X-Forwarded-Proto），导致 Strapi 认为连接不安全，拒绝设置 Secure Cookie。
- 开发/运维动作：
  - 确认 `backend/config/server.ts`：`proxy: true` 且 `url` = `STRAPI_ADMIN_BACKEND_URL`。
  - 更新 `deployment/Caddyfile`：将 `header_up X-Forwarded-Proto` 固定为 `https`（而不是上游 `{scheme}`）。
  - 确认 `backend/.env.production`：
    - `STRAPI_ADMIN_BACKEND_URL=https://api.gambleverify.com`
    - `FRONTEND_ORIGIN=https://app.gambleverify.com`
  - 重启反代与后端：`docker compose -f deployment/docker-compose.prod.yml restart caddy strapi`。
- 当前状态：代码已更新并推送；待服务器拉取并重启后再次登录验证。
- 验收计划：
  1) 登录 https://api.gambleverify.com/admin 成功（`POST /admin/login` → 200）。
  2) `/admin/init` 正常；无 `secure cookie` 报错出现在日志。
  3) 设置 Public 角色（或 Token），`/api/platforms` 等集合返回 200；`/api/search` 返回数据。
- 防回归：将“X-Forwarded-Proto=https + STRAPI_ADMIN_BACKEND_URL + proxy: true”纳入部署清单；更换代理或证书组件后必验此项。
