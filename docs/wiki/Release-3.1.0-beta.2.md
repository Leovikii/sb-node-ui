# v3.1.0-beta.2

[English](Release-3.1.0-beta.2.en)

`v3.1.0-beta.2` 是 Sing Sub 3.1 的第二个公开测试版，重点收束性能与编辑器细节。它不是稳定版；部署时仍应保留 `v3.0.0` 或上一可用 Worker version 作为回滚基线。

## 主要变化

- 使用 Mantine `JsonInput` 替换 CodeMirror，保留 JSON 校验、失焦格式化、等宽编辑和原生键盘撤销/重做，同时移除 16 个前端生产依赖。
- 全客户端 JS 降至 281.87 KiB gzip，相对 `v3.0.0` 增加约 13.4%，达到正式版不超过 15% 的预算；新增自动构建门禁防止回归。
- 规则集 Accordion 只保留区块 Badge 作为可见标题，移除输入区的重复标题。
- 规则来源底部统一显示最近更新时间、更新周期和删除操作；修改已有来源周期时保留后端已有的 `last_updated`。
- 资源与 Profile 编辑器的标题栏、预览/编辑切换及移动端滚动区进一步稳定，减少尺寸抖动和无意义重排。

## 升级与数据

- 本版本不修改 Worker API、workspace/revision schema、R2 object、订阅 Token、SRS 或 GitHub sync 数据格式，不需要数据迁移。
- 最近更新时间使用规则集文档中已有的 `last_updated` 字段，不创建新接口或额外存储。
- 沿用现有 R2 binding 和 runtime Secrets；不要因前端升级轮换或重新生成 Secret。
- 部署前运行 `npm ci`、`npm run verify` 和 `npm run worker:dry-run`，并保留上一可用 Worker version。

## 测试重点

- JSON 编辑器的语法错误、失焦格式化、保存与预览；
- 规则集来源的最近更新时间、更新周期和移动端控件布局；
- 预览/编辑切换时 Modal 标题和外框是否稳定；
- Profile 全屏弹窗滚动区与底部操作栏。

生产依赖审计仍会报告 React Router 的 RSC Mode CSRF 通告；Sing Sub 是纯浏览器 Hash Router 应用，不提供 RSC 或 server action endpoint，该攻击路径不可达。

完整步骤见[部署指南](DeploymentZH)和[发布与恢复](../operations/release-and-recovery.md)。
