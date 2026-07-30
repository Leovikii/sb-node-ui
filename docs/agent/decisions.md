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

## ADR-050：React 19 + Mantine 9

3.1.0 使用 React 19、Mantine 9、React Router、Zustand、react-i18next、`@mantine/form`、dnd-kit、CodeMirror 和 Lucide React。

本决策取代原 ADR-001 至 ADR-006 中的 Vue/PrimeVue/Pinia/Vue Router/Vue I18n 选型，取代 ADR-014 的 Tailwind 布局选型，并取代 ADR-039/040 的 PrimeVue/Vue 专属 UI 实现。后端、shared contract、路由 URL、用户能力和数据语义保持不变。

原因：产品负责人明确不继续使用 Vue；Mantine 是活跃、主流、MIT 的 React 组件库，能够原生覆盖当前基础交互、主题、响应式、动画和可访问性需求。

## ADR-051：依赖许可证门禁

PrimeVue 5 的发布包采用带资格门槛、年度确认和许可证密钥的自定义许可，因此不得升级或重新引入。所有新 UI runtime 依赖必须通过自动许可证扫描；自定义、source-available 或商业双轨许可证需要新的显式 ADR 和用户批准。

## ADR-052：短期双构建而非混合运行时

迁移期保留 Vue `index.html` 作为唯一生产入口，新增 `react.html` 供本地和 CI 验证。React 页面按 feature 完成，但不把 React mount 到 Vue 组件，也不让两个 router 共同控制同一页面。达到验收门槛后一次切换默认入口并删除旧栈。

该模式是 ADR-012 的受控例外：新入口必须持续构建和运行 E2E，任务台账必须给出明确退出条件，禁止演变为长期双前端。

