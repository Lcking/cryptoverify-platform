# 项目复盘与最佳实践总结（React + Strapi 全栈项目）

> 本文档总结本项目从设计、开发、部署到运维的全流程经验，归纳冗余与最佳实践，供后续类似项目高效参考。

---

## 1. 前端设计与代码实现

- 采用 Create React App，目录结构清晰（src/components/pages/sections/ui/data/config/lib）。
- 业务数据全部通过 `cmsClient.js` 统一管理，mock 数据与真实数据自动切换。
- 环境变量控制 CMS 对接（REACT_APP_ENABLE_CMS/REACT_APP_CMS_URL），mock 回退保证开发体验。
- UI 设计注重模块化与复用，文案集中管理，便于多语言和后期迭代。
- 推荐：所有 API 相关逻辑集中在 lib 层，页面只负责渲染和交互。

---

## 2. Strapi CMS 部署与构建、设置与编辑

- 使用 Docker Compose 部署，Node 20 + SQLite，开发/生产一致性高。
- **生产环境必须用 production mode**（npm run start），不能编辑内容类型结构。
- 内容类型修改流程：本地开发模式修改 → 提交代码 → 服务器拉取重启。
- 内容类型设计前期需与前端充分沟通，字段命名避免与 Strapi 内建冲突（如 status/publishedAt）。
- Public 角色权限务必放开 find/findOne，API Token 仅用于私有接口。
- CORS 配置只在 Strapi 处理，避免代理层重复设置。
- 管理员账号与本地/生产环境分离，重置流程需文档化。
- 推荐：内容类型、权限、API 路由变更后，务必同步前端 mock/normalize 逻辑。

---

## 3. 本地与线上 Docker 构建

- 本地开发：挂载代码目录，热更新，数据库卷持久化。
- 线上部署：Caddy/Nginx 反向代理，HTTPS 自动化，静态资源与 API 分域名隔离。
- 环境变量显式声明（docker-compose.yml），避免 env_file 注入不稳定。
- 推荐：每次构建前清理 node_modules/.cache 和 build 目录，确保环境变量注入。

---

## 4. 本地+GitHub+服务器联动开发实践

- 代码管理：本地开发 → GitHub 推送 → 服务器拉取 → 容器化构建。
- 文档管理：每个关键流程有独立 markdown 指南（迁移、升级、恢复、部署、联调等）。
- 推荐：所有环境变量、部署脚本、数据库迁移流程均纳入版本控制。
- 线上构建建议用 CI/CD 或一键脚本，避免手动操作遗漏。

---

## 5. Strapi 构建坑点与难题经验总结

- 代理 HTTPS 检测 bug：务必在 Koa 层强制 ctx.protocol = 'https'，否则后台登录失败。
- better-sqlite3 在 Alpine/musl 下编译失败，建议用 Debian 镜像。
- 内容类型字段命名冲突，需提前规划并与前端 normalize 逻辑对齐。
- 数据库迁移需备份，volume 挂载路径要明确。
- 推荐：每次升级 Strapi 或 Node，先在本地测试，记录所有兼容性问题。

---

## 6. 前端与 Strapi 数据打通问题与解决方案

- 环境变量注入失败 → docker-compose.yml 显式声明 REACT_APP_*
- CORS 头重复 → 只在 Strapi 配置 CORS，代理层不再设置
- Public 权限未放开 → 后台设置 find/findOne 权限
- API 路由变更 → 前端 cmsClient/normalize 逻辑同步更新
- 推荐：每次联调前，先用 curl/浏览器无痕模式验证 API，Network/Console 检查所有请求

---

## 7. 其他中小问题与经验汇总

- 文档管理：所有关键流程、问题、解决方案均有独立 markdown 文件，便于查阅和复盘。
- 任务管理：agentwork.md 按任务编号记录每次迭代，便于追踪和归档。
- 冗余流程：
  - 代理层和 Strapi 同时设置 CORS，实际只需一处。
  - 环境变量既用 env_file 又用 environment，建议只用 environment。
  - 数据库迁移脚本和手动流程可合并为一键脚本。
- 删繁就简建议：
  - 所有环境变量、权限、API 路由只在一处配置，避免多处重复。
  - 部署脚本、数据库迁移、构建流程全部自动化，减少人工干预。
  - 文档只保留最终最佳实践和常见问题，历史方案归档。

---

## 结论与最佳实践清单

1. 前后端接口、字段、权限、环境变量务必提前统一，避免后期反复调整。
2. 所有环境变量显式声明，构建前清理缓存，确保注入。
3. CORS 只在 Strapi 配置，代理层不再设置。
4. 生产环境所有变更（内容类型、权限、API 路由）同步前端 normalize 逻辑。
5. 关键流程、问题、解决方案均有独立文档，便于团队协作和复盘。
6. 部署、迁移、构建流程全部自动化，减少人工操作。
7. 任务管理按编号记录，便于追踪和归档。

---

> 本文档可作为后续 React + Strapi 全栈项目的标准流程模板，极大提升开发与运维效率。
