# v3.1.0 进度

更新日期：2026-07-31
回滚基线：`3.0.0`
当前候选：`3.1.0-beta.1`
状态：React/Mantine Beta 已部署生产并完成初步功能验证；FE-3159 已完成并保留真实后端页面供用户验收。

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
| FE-3154 | DONE | 卡片整面预览交互、Profile 拖曳层级与资源移动端布局优化 |
| FE-3155 | DONE | 资源预览切换控件首帧修复与 AppShell 品牌图标 |
| FE-3156 | DONE | Profile 筛选节点协议标签与移动端排版 |
| FE-3157 | DONE | 资源/Profile 编辑器标题、只读预览元数据与固定操作区统一 |
| FE-3158 | DONE | 编辑器标题行元数据收敛与预览/编辑原位切换 |
| FE-3159 | DONE | 编辑器预览标题紧凑排列与移动端弹性滚动区 |
| FE-3152 | DONE | 默认入口切换 React 与 Vue 迁移栈清理 |
| FE-3153 | DONE | `3.1.0-beta.1` 版本、公开文档与发布说明收束 |

状态只能使用 `TODO`、`IN_PROGRESS`、`DONE`、`BLOCKED`。只有验收条件全部满足时标记 `DONE`。

## 当前验证基线

- 生产前端：`index.html` 唯一入口挂载 React；Vue、PrimeVue、Pinia、Vue Router、Vue I18n、Tailwind、vuedraggable、旧 `.vue` 与迁移期 `react.html` 已清理。
- 专业依赖：CodeMirror、Lucide React 与 dnd-kit 分别保留代码编辑、图标和 Profile 排序能力。
- E2E：React 单入口共 11 个 Playwright 场景；Chromium 桌面/移动共 22 次执行通过，另有 Firefox 2 次专项通过。布局测试使用 role/label 或稳定 test id，不依赖 Mantine 私有 class。
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

### 2026-07-30：FE-3154 卡片交互与移动端边界

- 完成内容：资源与 Profile 卡片恢复整面预览入口，并以 Mantine `UnstyledButton` 保持键盘按钮语义；独立编辑、菜单、订阅和拖曳操作保持各自命中层。Profile 拖曳把手移到内容前导侧，管理操作保留在右侧；卡片 ActionIcon 与订阅操作统一为至少 44×44 px。
- 视觉取舍：移除同类资源页内重复的 `NODE`/`TEMPLATE`/`ADAPTER`/`RULESET` 类型 Badge；Ruleset 构建状态 Badge 继续保留。资源 `SimpleGrid` 改用 Mantine 原生响应式列数，修复 320 px 下由 300 px 最小列宽造成的 12 px 横向溢出。
- 真实后端：确认 `POST /api/preview` 只读取认证快照并临时生成内容后，将其加入本地只读代理的精确白名单；保存、删除、GitHub sync 与 SRS build 仍返回 403。真实 `vr` Profile 预览成功，未出现 `Forbidden` 或预览失败。
- 验证：lint、许可证门禁、四套 typecheck、115 unit、66 integration、production build 通过；Chromium 桌面/移动 46 项及受限环境外 Firefox 2 项 E2E 通过。新增 320 px 资源/Profile 无横向溢出、44 px 命中区、拖曳前导位置、冗余 Badge 缺失及键盘整面预览断言。
- 包体积：React 主入口 90.87 kB gzip，较前一基线增加约 0.01 kB；未增加依赖或自定义动画。
- 遗留风险：Firefox 在受限执行环境内仍会在 `browserContext.newPage()` 命中已知 `_page` 启动错误，脱离该限制后两项均通过；FE-3151 的 DevTools 性能审计与 Worker dry-run 仍未完成。
- 下一任务：继续 FE-3151 性能与 dry-run 门槛，或按用户反馈继续 UI 边界审查。

### 2026-07-30：FE-3155 资源切换控件与品牌图标

- 完成内容：资源编辑器的 `SegmentedControl` 显式启用 `fullWidth`；资源 Modal 统一改用 Mantine 原生 120 ms `fade`，避免桌面 `pop` 缩放首帧导致 FloatingIndicator 保留错误测量。AppShell 标题左侧使用 Mantine `Image` 嵌入仓库现有 `/favicon.svg`，固定为 36×36 px。
- 设计确认：移动端资源与 Profile 编辑器继续使用 Mantine `fullScreen` Modal。两者都包含长表单、代码/预览滚动区并可在预览和编辑间切换，全屏可避免软键盘与嵌套滚动压缩内容，当前无需改为普通弹窗。
- 验证：真实后端资源预览中，活动指示器与已选“预览”标签的 x 坐标和宽度误差均为 0 px；品牌图标实际尺寸为 36×36 px。lint、许可证门禁、四套 typecheck、115 unit、66 integration、production build、Chromium 桌面/移动 46 项及受限环境外 Firefox 2 项 E2E 通过。
- 回归测试：新增品牌图标来源/尺寸断言，以及桌面 Modal 稳定后 FloatingIndicator 与 checked radio label 的位置、宽度误差不超过 1 px 的布局契约。
- 包体积：React 主入口为 91.11 kB gzip，较 FE-3154 基线增加约 0.24 kB；未新增依赖、自定义动画或图像资产。
- 遗留风险：Firefox 受限环境启动问题及 FE-3151 的 DevTools 性能审计、Worker dry-run 状态不变。
- 下一任务：继续按用户反馈做 UI 边界审查，或完成 FE-3151 剩余门槛。

### 2026-07-30：FE-3156 Profile 节点协议标签

- 完成内容：Profile 筛选结果恢复“协议类型 + 节点名称”的信息层级，并沿用旧版协议等级语义；改用 Mantine 原生 `Badge` 与 `Tooltip`，通过优先、推荐、可用、标准、不推荐、结构、未分级七档文字和颜色表达等级。不推荐档使用琥珀色，红色继续只用于错误与危险状态。
- 移动端：标签允许在 flex 容器内收缩，最长宽度不超过匹配结果区；节点名称使用 Badge 原生单行省略，Tooltip 与 `aria-label` 保留协议、等级和完整节点名。新增 320 px 长节点名边界断言，同时覆盖优先、不推荐和未知协议。
- 文件/模块：`src-react/features/profiles/ProfilesPage.tsx`、`tests/e2e/react.smoke.spec.ts`、`docs/agent/engineering-standards.md`。
- 验证：lint、许可证门禁、四套 typecheck、115 unit、66 integration、production build 通过；Chromium 桌面/移动 48 项及受限环境外 Firefox 2 项 E2E 通过。新增场景断言页面无横向溢出、每个标签不越过结果容器、协议等级颜色不同且完整可访问名称可定位。
- 包体积：React 主入口保持 91.11 kB gzip；Profile feature chunk 为 21.64 kB gzip。未新增依赖、通用包装组件或自定义标签动画。
- 遗留风险：真实后端节点名称取决于用户数据，浏览器的 localhost URL 安全策略阻止了本轮连接失败后的可视化复核；响应式布局与真实 Chromium 渲染已由 Playwright 覆盖。Firefox 受限环境启动问题及 FE-3151 的 DevTools 性能审计、Worker dry-run 状态不变。
- 下一任务：继续按用户反馈检查真实数据下的视觉密度，或完成 FE-3151 剩余门槛。

### 2026-07-30：FE-3152/FE-3153 3.1 Beta 单入口收束

- 完成内容：版本更新为 `3.1.0-beta.1`，`index.html` 改为唯一 React 入口；删除迁移期 `react.html`、旧 Vue 源码、旧 Vue E2E、未引用的 MigrationPage 和 Vue tsconfig。package/lockfile 移除 Vue、PrimeVue、PrimeUI、Pinia、Vue Router、Vue I18n、Tailwind、vuedraggable、Lucide Vue 与对应 Vite/ESLint 工具。
- 文档：README、Wiki、部署恢复说明、Agent 架构/ADR/计划/依赖基线均已同步；新增中英文 Beta 发布说明，明确测试版身份、`v3.0.0` 回滚基线、无数据迁移及不轮换 Secret。
- 验证：干净 `npm ci`、lint、许可证门禁、shared/web/worker typecheck、115 unit、66 integration、production build 通过；React Chromium 桌面/移动各 11 项、Firefox 2 项 E2E 通过。`npm run worker:dry-run` 在受限环境外成功读取 55 个静态文件，上传预览 750.02 KiB / gzip 122.23 KiB，识别 `WORKSPACE_BUCKET` 后以 dry-run 退出。
- 依赖审计：生产依赖 audit 的 2 个 high 均为 React Router RSC Mode CSRF 同一通告；项目没有 RSC/server action，攻击路径不可达且上游暂无修复。包含开发工具的 audit 共 24 个 high，已在依赖基线记录来源，不执行强制 audit fix。
- 性能：Beta 首屏静态 JS 为 219.72 kB gzip，较 `v3.0.0` 的 248.53 kB 下降 11.6%；全部 feature 与 CodeMirror 均加载时为 394.46 kB，较 3.0 增加 58.7%，未达到正式版总 JS 预算。因此 FE-3151 保持 `IN_PROGRESS`，Beta 依据 ADR-053 作为有限例外测试。
- 遗留风险：尚未执行 git push、tag、GitHub Release 或生产部署。用户部署后仍需在真实生产入口复核登录、写操作、订阅、GitHub sync 与 SRS；正式 `3.1.0` 前需继续收束全量 JS 体积或明确修订预算。
- 下一任务：用户推送 Beta 后进行实际生产冒烟测试；随后完成 FE-3151 并决定正式版门槛。

### 2026-07-30：FE-3157 编辑器信息层级与操作区统一

- 生产反馈：用户已将 `3.1.0-beta.1` 与 FE-3157 部署生产并完成实际验证，未发现功能异常。
- 完成内容：资源与 Profile 弹窗统一以实体名称为主标题，并以资源类型或“配置”Mantine Badge 提供辅助上下文；新建实体保留“新建…”标题。预览态将名称和备注改为只读文本并隐藏保存，切回编辑态后恢复输入与保存。
- 交互层级：Profile 长表单改由 Mantine `ScrollArea` 独立滚动，底部取消/保存位于滚动区之外；预览态底部使用“完成”，与 Modal 右上角“关闭”保持不同的可访问名称。移动端继续使用全屏 Modal，标题、元数据与代码区无横向溢出。
- 文件/模块：`src-react/components/EntityEditorMetadata.tsx`、资源/Profile 页面、双语词条和 React E2E；ADR-054 与工程标准同步固化该规则。
- 验证：lint、许可证门禁、shared/web/worker typecheck、115 unit、66 integration、production build 通过；Chromium 桌面/移动共 22 项 E2E 通过，受限环境外 Firefox 2 项专项通过。新增断言覆盖标题语义、预览只读、编辑恢复、保存按钮滚动层级和 320 px 弹窗边界。
- 包体积：全部客户端 JS 为 395.58 KiB gzip，较 Beta 收束基线 394.46 KiB 增加 1.12 KiB（约 0.28%）；未新增依赖、自定义动画、overlay 或滚动锁。
- 遗留风险：FE-3151 的正式版总 JS 预算仍未完成。
- 下一任务：继续根据实际视觉反馈压缩编辑器信息层级；随后完成 FE-3151 体积收束。

### 2026-07-30：FE-3158 编辑器标题行收敛

- 生产反馈：FE-3157 功能正常，但预览窗口将名称同时显示在标题和只读元数据区，空备注也占据独立区域，形成三层顶部结构。
- 完成内容：资源与 Profile 编辑器改用 Mantine compound `Modal.Root/Header/Content/Body`；类型 Badge、名称、备注和关闭按钮统一进入标题行。预览态直接显示名称与非空备注，编辑态在同一位置原位切换为两个紧凑输入框，Modal Body 直接从模式切换开始。
- 响应式：共享 `EntityEditorHeader` 通过 Mantine `Group` 与弹性 style props 保持单行布局；320×900 下两个输入各约 99 px，关闭按钮位于最右侧，标题栏与弹窗横向溢出均为 0。
- 文件/模块：`src-react/components/EntityEditorChrome.tsx`、资源/Profile 页面、React E2E、ADR-054、工程标准和 3.1 计划。
- 验证：lint、许可证门禁、shared/web/worker typecheck、115 unit、66 integration、production build 通过；Chromium 桌面/移动共 22 项 E2E 通过，受限环境外 Firefox 2 项专项通过。真实后端只读浏览器测试覆盖 Profile 与模板的预览/编辑切换，控制台无 error/warn，未保存或写入生产数据。
- 包体积：全部客户端 JS 为 395.59 KiB gzip，较 FE-3157 的 395.58 KiB 增加约 0.01 KiB；未新增依赖、自定义 overlay、滚动锁或动画。
- 测试交接：`npm run dev:real-backend` 保持运行，浏览器保留 `http://127.0.0.1:8787/#/resources/templates` 的 `client` 模板编辑窗口供用户直接验收。
- 遗留风险：FE-3158 尚未部署生产；FE-3151 的正式版总 JS 预算仍未完成。
- 下一任务：用户完成视觉验收后部署 FE-3158，随后继续 FE-3151 体积收束。

### 2026-07-31：FE-3159 标题紧凑排列与移动端弹性滚动区

- 视觉反馈：预览态短名称与备注因平均分配标题栏空间而距离过远；Profile 全屏 Modal 的内容区仍固定为 `50dvh`，导致操作栏下方出现大块留白。
- 完成内容：预览名称改为按内容占宽并允许收缩，备注紧随名称、保持左对齐并吸收剩余空间；Profile 移动端表单、Modal Body、业务 `ScrollArea` 改用 Mantine 弹性布局，中间滚动区自动填满标题栏与固定操作栏之间的可用高度。桌面端继续使用 `50dvh` 内容高度。
- 回归保护：资源桌面与 Profile 320 px 预览断言名称/备注间距不超过 16 px；Profile 编辑态同时在 320×900 和 320×700 下断言滚动区随视口缩短约 200 px、操作栏距底部不超过 32 px且无横向溢出。
- 验证：完整 `npm run verify` 通过，包括许可证、shared/web/worker typecheck、115 unit、66 integration、production build、Chromium 桌面/移动 22 项和 Firefox 2 项 E2E。真实后端只读测试中，标题名称/备注实际间距 10 px；320×700 与 320×900 的滚动区分别约 504 px、704 px，操作栏始终距底部 16 px，横向溢出为 0。
- 包体积：全部客户端 JS 为 395.71 KiB gzip，较 FE-3158 增加约 0.12 KiB；未新增依赖、CSS Module、自定义滚动或动画实现。
- 测试交接：`npm run dev:real-backend` 保持运行，浏览器保留 `http://127.0.0.1:8787/#/profiles` 的 `zio` Profile 编辑窗口供用户验收；测试未修改字段或保存生产数据。
- 遗留风险：FE-3158/FE-3159 尚未部署生产；FE-3151 的正式版总 JS 预算仍未完成。
- 下一任务：用户完成视觉验收后部署本批 UI 修复，随后继续 FE-3151 体积收束。

## 完成记录模板

```text
### YYYY-MM-DD：FE-NNNN 标题
- 完成内容：
- 文件/模块：
- 验证：
- 遗留风险：
- 下一任务：
```
