# v3.1 前端依赖与包体积基线

记录日期：2026-07-30  
当前状态：`v3.1.0-beta.2` 已切换为 React 单入口并完成正式版总 JS 预算收束；本文件保留迁移初始数据用于同口径比较。

## 依赖许可

当前前端栈使用 React 19.2、Mantine 9.5、React Router、Zustand、i18next、dnd-kit、Lucide React 与 Zod。JSON 编辑使用 Mantine `JsonInput`，不再包含 CodeMirror。直接依赖的发布包采用 MIT、ISC 等宽松开源许可证，不需要许可证密钥、资格认证或年度续期。

`npm run check:licenses` 扫描 lockfile 中所有非 dev 包，只接受当前审核过的宽松许可证表达式。新增其他许可证时检查会失败，必须先人工阅读发布包条款并更新 ADR，不能仅凭项目主页声明放行。

当前非 dev 包许可证分布：

| 许可证 | 包数量 |
|---|---:|
| MIT | 52 |
| BSD-3-Clause | 1 |
| ISC | 1 |
| 0BSD | 1 |
| Apache-2.0 | 1 |
| MIT OR CC0-1.0 | 1 |

PrimeVue 4 仅在旧 Vue 入口迁移期使用；`v3.1.0-beta.1` 的 manifest 与 lockfile 已不包含 PrimeVue、PrimeUI、Vue、Pinia 或 Tailwind。PrimeVue 5 仍禁止引入。

## 构建基线

使用 Vite 8.1.4 的同一次双入口 production build：

| 入口资源 | 原始大小 | gzip |
|---|---:|---:|
| Vue 入口 JS | 522.91 kB | 139.72 kB |
| React 入口 JS | 547.95 kB | 171.09 kB |
| Vue 入口 CSS | 33.28 kB | 7.09 kB |
| React 入口 CSS | 231.73 kB | 33.90 kB |

React 当前只是未做拆分的平台骨架，gzip JS 比 Vue 入口高约 22%。该值不是切换验收结果；后续必须按路由和重型 feature 懒加载，并在 FE-3151 达到计划中的 JS 增幅门槛。Mantine CSS 是静态样式，不允许为追求复刻旧视觉再叠加 Tailwind 或第二套样式系统。

## 业务迁移后拆包检查点

完成 Profile、资源、Ruleset、Sync 与设置迁移后，已按路由拆分重型 feature；以下为 2026-07-30 同一 Vite 构建结果：

| React 资源 | 原始大小 | gzip |
|---|---:|---:|
| 主入口 JS | 292.13 kB | 90.69 kB |
| Profile feature | 64.89 kB | 21.11 kB |
| Resources/Ruleset feature | 24.32 kB | 8.43 kB |
| Sync feature | 4.43 kB | 1.79 kB |
| React CSS | 231.73 kB | 33.90 kB |

主入口单文件已较未拆分状态下降约 65%，Profile、Resources 与 CodeMirror 均不会在认证首屏执行。最终 FE-3151 仍需以浏览器网络依赖链计算真实首屏传输量，不能只相加构建清单或只看入口单文件。

## Beta 单入口验收

使用 `v3.0.0` tag 与当前 `v3.1.0-beta.1` 分别执行干净 `npm ci` 和 production build：

| 指标 | v3.0.0 | v3.1.0-beta.1 | 变化 |
|---|---:|---:|---:|
| 首屏静态 JS gzip | 248.53 kB | 219.72 kB | -11.6% |
| 全部客户端 JS gzip | 248.53 kB | 394.46 kB | +58.7% |
| 全部客户端 JS 原始大小 | 735.72 kB | 1,220.19 kB | +65.8% |
| 入口 CSS gzip | 8.91 kB | 33.90 kB | +280.5% |

Beta 首屏通过原计划“不高于 3.0 入口 10%”的门槛，并通过路由与 CodeMirror lazy 验证；全量加载所有 feature 后的 JS 未达到“总量增幅不超过 15%”的正式版门槛。`FE-3151` 因此继续为 `IN_PROGRESS`，Agent 风险记录必须保留该已知体积问题，正式版前继续评估 Mantine/CodeMirror 与 feature chunk 成本。

## Beta.2 性能收束

`v3.1.0-beta.2` 使用 Mantine `JsonInput` 替换 CodeMirror，并从 production dependencies 移除 16 个 CodeMirror/Lezer/辅助包。补齐轻量查找/替换后的相同 Vite 生产构建口径下，全部 `dist/assets/*.js` 为 283.30 KiB gzip，较 `v3.0.0` 的 248.53 KiB 增加约 14.0%，低于正式版 15% 上限 285.81 KiB。

`npm run check:bundle` 在 production build 后重新 gzip 所有客户端 JS chunk；`npm run verify` 已包含该门禁。主路由、资源、Profile 与其他 feature 继续按需加载，但预算不会因懒加载而忽略任何客户端功能代码。

## Beta.2 DevTools 审计

在 CPU 1×、无网络限速的 localhost 上，以 Wrangler production build、已登录资源页采集 Chrome DevTools trace：

| 指标 | 结果 | 判断 |
|---|---:|---|
| LCP | 554 ms | 良好 |
| INP | 13 ms | 良好 |
| CLS | 0.00 | 良好 |
| 最大关键请求链 | 212 ms | 无需专项优化 |

CSS 与 `theme-init.js` 被工具列为 render-blocking，但预计 FCP/LCP 可节省时间均为 0 ms，因此不建议为该提示增加 preload、内联样式或新的拆包复杂度。Vite + 真实后端对照为 LCP 1553 ms、CLS 0.0001，其中 `/api/bootstrap` 约 1.1 秒；Ruleset build 状态请求约 3.5–4.7 秒但发生在 LCP 后，不属于首屏阻塞。

资源弹窗的预览/编辑切换另以连续 12 个 `requestAnimationFrame` 采样，Dialog 的位置与尺寸误差均不超过 1 px。可见运动来自 Mantine `SegmentedControl` 原生指示器，而非 Modal 外框重排；保留该低成本反馈，不增加自定义动画或强制禁用 transition。以上数据没有 CrUX 实际用户样本，不能替代部署后的真实设备观察。

## 安全审计状态

干净安装后 `npm audit --omit=dev` 报告 2 个 high，均来自 `react-router-dom -> react-router` 的同一项 RSC Mode CSRF 通告。本项目仅使用浏览器端 `createHashRouter`，没有 React Server Components、server action 或 RSC endpoint，通告描述的攻击路径不可达；当前上游没有可用修复版本。

包含开发依赖的 audit 报告 24 个 high，来源包括 Vite/PostCSS、ESLint/minimatch、Vitest、Wrangler/Miniflare/Sharp 及上述 React Router 通告。它们不进入 Worker 静态资源运行时，但 CI 与本地工具链仍需随上游修复持续升级。禁止使用 `npm audit fix --force` 破坏锁定版本。
