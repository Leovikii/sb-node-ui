# v3.1.0 进度

更新日期：2026-07-30  
当前稳定版：`3.0.0`  
目标版：`3.1.0`  
状态：React/Mantine 迁移已启动，生产入口仍为 Vue。

## 任务台账

| ID | 状态 | 内容 |
|---|---|---|
| FE-3100 | DONE | Agent 文档入口、ADR、计划与历史压缩 |
| FE-3101 | DONE | 许可证和 bundle 基线检查 |
| FE-3102 | DONE | E2E 去 PrimeVue 私有选择器 |
| FE-3103 | DONE | React 独立入口、tsconfig 与构建脚本 |
| FE-3110 | DONE | Mantine Provider、主题与首帧颜色模式 |
| FE-3111 | DONE | react-i18next、双语迁移与 key parity test |
| FE-3112–FE-3114 | DONE | Router session guard、stores、API |
| FE-3120–FE-3123 | DONE | Shell、认证、设置、全局反馈 |
| FE-3130–FE-3133 | DONE | 资源、CodeMirror、Ruleset 编辑与构建状态 |
| FE-3140–FE-3144 | DONE | Profile 与 GitHub Sync |
| FE-3150 | DONE | 完整桌面、移动端、双语、Firefox 与键盘回归 |
| FE-3151 | IN_PROGRESS | 包体积、首帧与性能验收 |
| FE-3152–FE-3153 | TODO | 生产入口切换、Vue 清理与 3.1 发布收束 |

状态只能使用 `TODO`、`IN_PROGRESS`、`DONE`、`BLOCKED`。只有验收条件全部满足时标记 `DONE`。

## 当前验证基线

- 3.0 源码：43 个前端 TS/Vue/CSS 文件，约 5,741 行；其中 25 个 Vue 文件约 4,407 行。
- 专业依赖：CodeMirror、Lucide、vuedraggable 保留对应能力，React 侧分别使用 CodeMirror、Lucide React、dnd-kit。
- E2E：Vue 与 React 双入口共 23 个 Playwright 场景；Chromium 桌面/移动共 46 次执行通过，React 10 个场景在两端共 20 次执行通过；另有 Firefox 2 次专项通过。布局测试已改用 role/label 或稳定 test id，不再依赖 PrimeVue/Mantine 私有 class。
- Worker/shared/backend 不在 3.1 迁移范围。

## 会话记录

### 2026-07-30：3.1 计划启动

- 用户确认不继续使用 Vue，选择 React + Mantine。
- PrimeVue 5 因自定义许可、资格门槛、年度确认和许可证密钥要求被排除。
- 建立短期双构建、单生产入口策略；不实现 Vue/React 运行时桥接。
- 将 3.0 逐会话历史压缩为摘要，用户文档与 Agent 开发入口分离。
- 后续状态：FE-3100、FE-3101、FE-3103 与 FE-3110 已在本次工作中完成。

### 2026-07-30：FE-3100 文档入口与历史压缩

- 完成内容：建立根目录 Agent 入口和 3.1 计划/ADR/进度台账；公开 README 只保留用户与运维文档入口。
- 文件/模块：`AGENTS.md`、`docs/agent`、`docs/README.md`、中英文 README。
- 验证：旧工程文档链接已清零；3.0 详细过程压缩为一份历史摘要，完整历史由 Git 保留。
- 遗留风险：公开 Wiki 在生产入口切换前仍描述 3.0，符合当前稳定版状态。
- 下一任务：FE-3103 React 独立入口。

### 2026-07-30：FE-3101/FE-3103/FE-3110 迁移基础

- 完成内容：锁定 React/Mantine 依赖并建立许可证门禁；新增 `react.html` 双构建入口、React tsconfig、ESLint 规则、Mantine Provider、颜色模式与迁移期 AppShell。
- 文件/模块：`package.json`、`package-lock.json`、`vite.config.ts`、`tsconfig.react.json`、`src-react`、`react.html`、`scripts/check-ui-licenses.mjs`。
- 验证：lint、全量 typecheck、173 个 unit/integration tests、双入口 production build 通过；本地浏览器验证中英文/明暗切换、390 px 无横向滚动和移动导航，无 console error/warning。
- 遗留风险：React 入口 gzip JS 为 171.09 kB，尚未达到最终切换门槛；npm 安装报告 7 个 high severity 项，外发审计未获许可，尚待归因。
- 下一任务：FE-3111 i18n parity test，然后实现 session guard 与 Zustand store。

### 2026-07-30：FE-3111–FE-3123 React 平台、认证与设置

- 完成内容：共享中英文词条、parity test、Zustand session/workspace/assets/sync stores、401 会话清理、Bootstrap 去重、路由守卫、Mantine AppShell、认证与四个设置页。
- 文件/模块：`src-react/app`、`src-react/stores`、`src-react/i18n`、`src-react/features/auth`、`src-react/features/settings`。
- 验证：React 类型检查、i18n/store/API 单测及桌面/移动认证、主题、语言、导航、退出和设置 E2E 通过。
- 遗留风险：Vue 仍为生产入口；真实会话与浏览器凭据尚未人工验证。
- 下一任务：资源、Profile、Ruleset 与 Sync 迁移。

### 2026-07-30：FE-3130–FE-3144 业务页面迁移

- 完成内容：通用 JSON 资源 CRUD、lazy CodeMirror、结构化 Ruleset 来源/手工规则编辑、build retry 与 JSON/SRS 链接；Profile 创建/预览/复制/删除、Mantine form 引用选择、筛选、dnd-kit 排序、revision conflict；GitHub sync preflight/push/pull/conflict。
- 文件/模块：`src-react/features/resources`、`src-react/features/profiles`、`src-react/features/sync`、`tests/e2e/react.smoke.spec.ts`。
- 验证：React 9 个场景在 desktop Chromium 与 mobile Chromium 共 18 次执行通过；Profile 与 Ruleset 的保存请求、revision、预览、复制和构建行为均由 mock API 断言，并覆盖 320/390/412/768/1440 viewport、键盘 Modal 与 reduced-motion 偏好。
- 遗留风险：规则来源保存会触发真实 Worker 外部抓取，必须在登录后的人工环境验证；生产入口仍未切换。
- 下一任务：FE-3150/FE-3151 完整回归和性能验收。

### 2026-07-30：FE-3102/FE-3151 测试解耦与路由拆包

- 完成内容：旧 Vue 布局测试以 `data-testid` 表达稳定布局契约，移除 `.p-dialog-*`/`.p-selectbutton` 选择器；React Profile、资源、Sync 和设置页面改为路由级 lazy chunk，CodeMirror 继续二级 lazy。
- 验证：lint、shared/web/react/worker typecheck、113 unit、66 integration、双入口 production build 通过；Chromium 双入口 44 次 E2E 通过。React 主入口从 850.70 kB/256.35 kB gzip 降至 292.13 kB/90.69 kB gzip，Profile 与资源分别拆为 21.11 kB 和 8.43 kB gzip feature chunk。
- 遗留风险：本机 Playwright Firefox 151 在空项目 `browser.newPage()` 即触发内部 `_page` 异常，两次专项重跑均失败；浏览器重新安装下载无响应后已终止。该问题独立于应用代码，FE-3150 暂不标记完成。
- 下一任务：修复/更换 Firefox 自动化运行时，补齐键盘、reduced-motion、完整 viewport 与真实登录人工测试，再评估生产入口切换。

### 2026-07-30：FE-3150 本地真实 Worker 与跨浏览器回归

- 完成内容：使用 `.dev.vars` 管理员口令登录本地 Wrangler Worker 与本地 R2，完成退出、重新登录、资源创建/删除和会话保持验证；修复 React i18next 未兼容共享 Vue I18n 单花括号占位符的问题，并增加删除确认文案 E2E。
- 文件/模块：`src-react/i18n/index.ts`、`tests/e2e/react.smoke.spec.ts`。
- 验证：`npm run verify` 全量通过，包括 lint、许可证门禁、四套 typecheck、113 unit、66 integration、production build、桌面/移动 Chromium 44 次及 Firefox 2 次 E2E；本地生产构建浏览器控制台无 error/warning，测试 R2 对象已删除。
- 遗留风险：Firefox 在受限执行环境中无法派生 tab 子进程，脱离该限制后可稳定通过；`worker:dry-run` 的构建阶段通过，但 `wrangler deploy --dry-run` 因环境策略要求用户显式授权而未执行；当前未配置 Chrome DevTools MCP，无法完成 LCP/CLS 与首屏网络依赖链审计。真实部署的会话 Cookie、外部规则来源抓取和 GitHub/SRS 集成仍需用户授权登录实际后端验证。生产入口仍未切换。
- 下一任务：完成 FE-3151 首屏网络/性能验收和 Worker dry-run，再决定是否进入 FE-3152。

### 2026-07-30：真实后端只读预览入口

- 完成内容：新增固定上游的本地 React/Vite 入口，将认证与只读 typed API 请求代理到 `https://ss.vkio.org`；用户可直接在本地迁移前端登录真实后端，无需部署 React。
- 文件/模块：`scripts/run-real-backend-preview.mjs`、`tests/unit/real-backend-preview.test.ts`、`package.json`、`docs/agent/real-backend-preview.md`。
- 验证：lint、全量 typecheck、2 项代理策略单测通过；真实 bootstrap 成功返回登录页；运行时 PUT `/api/settings` 被 403 拦截，浏览器无 error/warning。
- 遗留风险：该入口刻意不覆盖真实写操作；保存、删除、GitHub push/pull、SRS build 等必须使用隔离 staging 或获得用户对具体真实数据操作的明确授权。
- 下一任务：用户完成真实后端登录后，继续只读检查 React 页面和真实状态。

### 2026-07-30：FE-3151 导航边界与原生动效

- 完成内容：分层导航改用 Mantine `Stack` 建立安全间距，并以 `subtle` 父级和 `light` 当前子级区分层次；路由内容增加 120 ms Mantine `Transition` 淡入，资源/Profile 操作菜单启用 120 ms 原生 `pop`，不等待离场动画。
- 文件/模块：`src-react/app/shell/AppShell.tsx`、`src-react/features/resources/ResourcesPage.tsx`、`src-react/features/profiles/ProfilesPage.tsx`、`tests/e2e/react.smoke.spec.ts`、`docs/agent/engineering-standards.md`。
- 验证：`npm run verify` 全量通过，包括 115 unit、66 integration、桌面/移动 Chromium 46 次和 Firefox 2 次 E2E；390 px 导航父子项实际间距 8 px、无横向溢出，普通模式路由为 opacity 120 ms、菜单为 transform/opacity 120 ms，reduced-motion 下为 0 ms。真实后端只读页面切换及控制台验证通过。
- 包体积：React 主入口由 90.72 kB gzip 增至 90.86 kB，约增加 0.14 kB；资源与 Profile feature 各约增加 0.01 kB gzip，未引入新依赖或自定义动画代码。
- 遗留风险：FE-3151 仍等待 Chrome DevTools MCP 的 LCP/CLS/网络依赖链审计和获得明确授权后的 Worker dry-run；生产入口仍未切换。
- 下一任务：完成剩余性能与 dry-run 门槛，再评估 FE-3152。

## 完成记录模板

```text
### YYYY-MM-DD：FE-NNNN 标题
- 完成内容：
- 文件/模块：
- 验证：
- 遗留风险：
- 下一任务：
```
