# 架构决策

状态：`ACCEPTED` 已锁定；`PROPOSED` 待实施前确认；`SUPERSEDED` 已被后续决策取代。

## 当前有效决策

| ID | 状态 | 决策 |
|---|---|---|
| ADR-007 | ACCEPTED | Worker 使用 ports/adapters 隔离 domain、application、HTTP 与 infrastructure。 |
| ADR-010 | ACCEPTED | 每个 Worker 部署只管理一个 `primary` workspace。 |
| ADR-011 | ACCEPTED | API 返回稳定错误码，前端翻译用户文案。 |
| ADR-012 | ACCEPTED | 迁移分阶段验证；兼容层在最后调用方迁移后立即删除。 |
| ADR-019/020 | ACCEPTED | GitHub Actions 是无状态 SRS 编译器，通过 Worker callback 发布到 R2。 |
| ADR-021/038 | ACCEPTED | GitHub private 仅作用户主动 sync/backup，并使用 base/local/remote 安全方向比较。 |
| ADR-024 | ACCEPTED | SRS 异步构建，失败保留旧 active artifact。 |
| ADR-025 | ACCEPTED | R2 使用平台静态加密；日志和 UI 不泄露凭据。 |
| ADR-027/029/030 | ACCEPTED | R2 Standard 是唯一持久化，使用软预算；最终无 KV/D1。 |
| ADR-032/035/036 | ACCEPTED | Ruleset JSON/SRS 公开分发；私有配置使用短 Token；订阅按 current revision 动态构建。 |
| ADR-037 | ACCEPTED | SRS 使用短期 job ticket 自动 provision。 |
| ADR-043 | ACCEPTED | Profile 使用严格 replacement adapter，不恢复通用 patch DSL。 |
| ADR-047/048 | ACCEPTED | Fork + Cloudflare Workers Builds 是部署模型，代码 rollback 与 R2 restore 分离。 |
| ADR-049 | ACCEPTED | 项目许可证为 GPL-3.0-only。 |
| ADR-050 | ACCEPTED | 3.1 前端迁移到 React 19 + Mantine 9。 |
| ADR-051 | ACCEPTED | UI 依赖必须无商业资格门槛、许可证密钥和续期要求。 |
| ADR-052 | ACCEPTED | 迁移采用短期双构建、单生产入口；不在运行时桥接 Vue 与 React。 |
| ADR-053 | ACCEPTED | `3.1.0-beta.1` 切换默认入口到 React，并删除已无调用方的 Vue 迁移栈；`3.0.0` 保留为代码回滚基线。 |
| ADR-054 | ACCEPTED | 资源与 Profile 编辑器统一以实体名称为主标题、类型为辅助信息；预览态元数据只读，操作区独立于可滚动内容。 |
| ADR-055 | ACCEPTED | JSON 资源编辑改用 Mantine `JsonInput`，移除 CodeMirror 运行时并以自动化总 JS 预算门禁防止回归。 |

## ADR-050：React 19 + Mantine 9

3.1.0 使用 React 19、Mantine 9、React Router、Zustand、react-i18next、`@mantine/form`、dnd-kit、Mantine `JsonInput` 和 Lucide React；CodeMirror 选型已由 ADR-055 取代。

本决策取代原 ADR-001 至 ADR-006 中的 Vue/PrimeVue/Pinia/Vue Router/Vue I18n 选型，取代 ADR-014 的 Tailwind 布局选型，并取代 ADR-039/040 的 PrimeVue/Vue 专属 UI 实现。后端、shared contract、路由 URL、用户能力和数据语义保持不变。

原因：产品负责人明确不继续使用 Vue；Mantine 是活跃、主流、MIT 的 React 组件库，能够原生覆盖当前基础交互、主题、响应式、动画和可访问性需求。

## ADR-051：依赖许可证门禁

PrimeVue 5 的发布包采用带资格门槛、年度确认和许可证密钥的自定义许可，因此不得升级或重新引入。所有新 UI runtime 依赖必须通过自动许可证扫描；自定义、source-available 或商业双轨许可证需要新的显式 ADR 和用户批准。

## ADR-052：短期双构建而非混合运行时

迁移期保留 Vue `index.html` 作为唯一生产入口，新增 `react.html` 供本地和 CI 验证。React 页面按 feature 完成，但不把 React mount 到 Vue 组件，也不让两个 router 共同控制同一页面。达到验收门槛后一次切换默认入口并删除旧栈。

该模式是 ADR-012 的受控例外：新入口必须持续构建和运行 E2E，任务台账必须给出明确退出条件，禁止演变为长期双前端。

## ADR-053：3.1 Beta 生产候选与旧前端退场

产品负责人确认 `3.1.0-beta.1` 作为 React/Mantine 测试版生产候选。默认 `index.html` 切换到 React；迁移期 `react.html`、旧 Vue 页面、旧 Vue E2E、PrimeVue/Pinia/Vue Router/Vue I18n/Tailwind/vuedraggable 依赖在同一变更中删除，避免测试版继续携带两套前端。

`3.0.0` 只作为已发布代码与 Worker version 的回滚基线，不作为当前测试版 UI 的运行时兼容层。本决策不授权部署、推送、打 tag、发布 GitHub Release、修改 R2 或轮换 Secret；这些仍需用户对具体操作的明确请求。

Beta 切换是对正式版总包体积门槛的有限例外：首屏、功能回归、许可证和 Worker dry-run 必须通过，但 `FE-3151` 在全量客户端 JS 达到预算或另行批准预算前保持 `IN_PROGRESS`。测试版不得因此被标记为稳定版。

## ADR-054：编辑器标题、只读预览与操作区层级

资源与 Profile 弹窗采用相同的信息层级：已有实体以名称作为主标题，资源类型或“配置”只用 Mantine `Badge` 作为辅助上下文；新建实体以“新建…”作为主标题。类型不能取代实体名称，因为名称才是用户在列表和编辑流程中识别对象的稳定标识。

类型、名称、备注与关闭按钮统一位于 Mantine `Modal.Header`：预览态名称按内容占宽，非空备注紧随其后并保持左对齐；编辑态在相同位置原位切换为名称和备注输入框，Modal Body 不再重复渲染元数据。模式切换与底部操作区位于可滚动业务内容之外，长表单和代码预览统一使用 Mantine `ScrollArea` 独立滚动，避免取消和保存按钮随内容离开视口。移动端继续使用全屏 Modal，ScrollArea 通过 Mantine 弹性布局填满标题与操作区之间的剩余高度，不实现自定义 sticky、滚动锁或 overlay。

## ADR-055：用 Mantine JsonInput 收束 JSON 编辑器体积

`3.1.0-beta.2` 将通用 JSON 资源编辑器从 CodeMirror 6 替换为 Mantine `JsonInput`。保留受控编辑、JSON 语法校验、失焦格式化、等宽字体、原生键盘撤销/重做、只读预览和保存前完整解析；不再提供 CodeMirror 专属行号、语法高亮、内嵌搜索面板和工具栏按钮。

原因：CodeMirror 及其 commands、language、lint、search、state、theme、view 依赖形成约 116.8 KiB gzip 的二级懒加载代码，是全客户端 JS 超出正式版预算的决定性来源。`JsonInput` 已包含在锁定的 Mantine 运行时中，功能覆盖当前业务正确性所需能力，也更符合“优先组件库原生能力、减少自定义实现”的迁移原则。

构建后必须自动计算 `dist/assets/*.js` 的 gzip 总量，并维持不高于 `v3.0.0` 全客户端 JS 基线 248.53 KiB 的 115%，即 285.81 KiB。该门禁衡量全部懒加载功能，而不只衡量首屏入口；修改预算需要新的显式决策。

