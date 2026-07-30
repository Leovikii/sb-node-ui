# v3.1.0-beta.1

[English](Release-3.1.0-beta.1.en)

`v3.1.0-beta.1` 是 Sing Sub 3.1 的首个公开测试版，适合在保留 `v3.0.0` 回滚能力的环境中验证。它不是稳定版。

## 主要变化

- WebUI 从 Vue/PrimeVue 重构为 React 19 + Mantine 9，并删除旧前端运行时依赖。
- 默认站点入口直接加载 React；现有路由、双语、明暗主题与 Cloudflare Worker API 保持兼容。
- 资源、Profile、Ruleset、GitHub 同步和设置页使用 Mantine 原生组件、表单、模态框、通知与轻量动效。
- 改进 320–1440 px 响应式布局、触控目标、键盘操作、reduced-motion 和节点协议标签语义。
- CodeMirror、Profile 排序和重型页面继续按需加载，不引入商业组件或许可证密钥。

## 升级与数据

- 本版本不修改 workspace、revision、R2 object、订阅 Token、SRS 或 GitHub sync 数据格式，不需要数据迁移。
- 沿用现有 `WORKSPACE_BUCKET` 和三个 runtime Secret；不要重新生成、轮换或删除 Secret。
- 部署前运行 `npm ci`、`npm run verify` 和 `npm run worker:dry-run`，并保留上一可用 Worker version。
- 若测试版出现问题，只回滚 Worker code version；不要清空 R2、倒退 `head.json` 或恢复旧数据快照。

## 测试重点

- 登录、Profile 预览与订阅链接；
- 节点、模板、适配器和规则集的读取与编辑；
- GitHub push/pull 冲突方向与 SRS 编译状态；
- 手机端弹窗、长节点名称、暗色首帧及页面切换。

## 已知限制

- 首屏静态 JS 比 `v3.0.0` 更小，但加载所有按需页面和 CodeMirror 后的客户端 JS 总量更大；正式版前将继续优化全量体积。
- npm 的 React Router RSC Mode CSRF 通告会出现在生产依赖审计中；Sing Sub 是纯浏览器 Hash Router 应用，不提供 RSC 或 server action endpoint，该攻击路径不可达。

完整部署与恢复步骤见[部署指南](DeploymentZH)和[发布与恢复](../operations/release-and-recovery.md)。
