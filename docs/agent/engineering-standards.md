# 工程标准

## 1. 不可破坏的边界

- Domain 不依赖 application、HTTP、infrastructure 或 UI。
- Application 只依赖 domain、shared contract 和 port interface。
- HTTP route 只做请求解析、认证、schema、use case 调用和响应映射。
- 浏览器只通过 typed API client 访问服务端，不直接调用 R2、GitHub 或全局 `fetch`。
- 跨层传递明确 DTO，不传播 R2 object、GitHub response、React 类型或 UI 状态。
- R2 Standard 仍是唯一持久化真相来源；GitHub 只是用户主动触发的 sync/backup gateway。

详细数据、revision、SRS、会话和同步语义见 [data-architecture.md](./data-architecture.md)。

## 2. API 与错误

- 成功响应使用 `{ data, meta? }`，失败响应使用 `{ error: { code, details?, requestId? } }`。
- 错误码来自 `shared/contracts/errors.ts`；用户文案由前端按错误码翻译。
- 所有 endpoint 返回具体类型，不允许公共 API 返回 `any`。
- 401 只清理会话并跳转登录；409 revision conflict 必须要求 reload/discard/replace 的明确选择。
- Toast、日志和错误不得包含私钥、PAT、Cookie、订阅 Token 或完整私有 JSON。

## 3. React 与 Mantine

- 使用实施时最新稳定 React 19、Mantine 9；禁止 alpha、beta、RC 和 preview build。
- 基础交互来自 Mantine。Button、ActionIcon、Input、Select、Modal、Popover、Menu、Tooltip、Notification、Alert、Badge、Tabs、AppShell 不得自研。
- 不机械包装 Mantine primitive；只有业务语义或第三方适配边界允许薄组件。
- 使用 `@mantine/form` 与 Zod 管理结构化表单；未保存 draft 不直接写 Zustand store。
- 使用 `@mantine/modals` 和 `@mantine/notifications`，不建立自研 overlay、focus trap、scroll lock 或通知中心。
- 优先使用 Mantine `AppShell`、`Stack`、`Group`、`Flex`、`Grid`、`SimpleGrid`、`Container` 和 style props。
- 重复列表或复杂响应式布局使用 CSS Modules；不要在大列表上生成大量独立 responsive inline style。
- 不引入 Tailwind、CSS-in-JS 库或独立动画库。保留 CSS 只用于 CodeMirror、拖拽、稳定编辑器布局和浏览器级主题初始化。
- 动画使用 Mantine 原生 transition，尊重 `prefers-reduced-motion`；路由切换不得串行等待离场动画。
- 路由与操作菜单的提示性动效以 150 ms 内的 opacity/transform 为限；不对列表逐项错峰，不用动效阻塞内容挂载或用户输入。

## 4. 状态、路由与 i18n

- React Router 表达 `/connect`、`/profiles`、`/resources/:kind`、`/sync`、`/settings/:section`。
- Zustand store 对应 session、workspace、assets、rulesets、sync；不要把所有局部 UI 状态塞入全局 store。
- 保存、SRS 构建、GitHub sync 使用相互独立状态机。
- react-i18next 首批支持 `zh-CN`、`en-US`，新 key 必须双语齐全并由测试检查 parity。
- 用户可见文本不得硬编码；字段 label 使用名词，按钮使用明确动词。
- locale、document language、颜色方案和 localStorage 必须同步；暗色首帧不得白闪。

## 5. 可访问性与响应式

- Modal 必须有可访问名称、focus trap、focus restore、Escape 和 scroll lock，全部由 Mantine 提供。
- icon-only action 必须有本地化 `aria-label` 和 Tooltip。
- 表单错误必须关联对应字段；危险操作明确方向和后果。
- 触控目标至少 44×44 CSS px；320、390、412、768、1440 宽度不得产生非业务横向滚动。
- 编辑/预览、复制反馈、加载状态不得推动相邻工具栏控件。
- 分层导航同时显示父级与当前子级状态时，必须使用不同视觉层级并保留至少 4 CSS px 的安全间距，避免背景、边框或阴影粘连。
- 可预览实体的卡片应提供覆盖卡片内容面的原生按钮目标；编辑、拖曳、复制、菜单等独立操作必须保持独立按钮语义，不得嵌套交互元素。
- 同类资源列表不重复显示页面已明确表达的资源类型 Badge；Badge 只保留构建状态、错误、连接状态等有信息增量的语义。
- 可排序卡片的拖曳把手位于内容前导侧，与编辑/更多操作分组；卡片操作与拖曳把手的命中区至少 44×44 CSS px。
- Profile 筛选结果必须同时显示节点协议类型和节点名称；颜色只增强协议分级，不得作为唯一信息来源。长标签在移动端不得撑破容器，完整语义由 Tooltip 与可访问名称保留。
- 资源与 Profile 编辑器将类型、名称、备注和关闭按钮统一放在 Modal Header；预览态名称按内容占宽，备注紧随其后并保持左对齐，编辑态在相同位置原位切换为输入框，Modal Body 不得重复元数据。长业务表单或预览内容使用独立 ScrollArea，底部操作区不得进入该滚动区域；移动端全屏 Modal 的 ScrollArea 必须弹性填满标题与操作区之间的剩余高度，不得保留固定 `vh` 高度造成底部留白。
- Playwright 必须覆盖桌面、移动端、Firefox 专项、双语和键盘操作。

## 6. 依赖与许可证

- UI runtime 依赖必须为 OSI 批准的开源许可证，优先 MIT/BSD/Apache-2.0/ISC。
- 拒绝许可证密钥、营收/人数/融资资格、年度续期、强制展示许可提示或 `SEE LICENSE IN ...` 且无法自动审计的包。
- 商业模板、Pro component、付费主题和闭源扩展不进入依赖树。
- 新依赖必须替代明确自研成本；提交 lockfile，记录许可证与引入理由。

## 7. 测试与交付

- 测试优先使用 role、label 和可见语义；不要依赖 `.mantine-*`、`.p-*` 等库内部 class。
- 只有稳定布局契约使用 `data-testid`。
- 每个 bug 修复先添加复现测试；不能自动化时记录替代验证。
- 必跑：lint、shared/web/worker typecheck、unit、integration、production build、关键 E2E。
- 切换生产入口前还必须通过 Worker dry-run、许可证扫描、bundle 对比、暗色首帧和完整 viewport 矩阵。
- 不部署、不写生产 R2、不发布版本，除非用户明确授权。

