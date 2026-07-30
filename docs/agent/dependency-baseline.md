# v3.1 前端依赖与包体积基线

记录日期：2026-07-30  
基线提交状态：React 独立入口已建立，Vue 仍是唯一生产入口。

## 依赖许可

新增前端栈使用 React 19.2、Mantine 9.5、React Router、Zustand、i18next、dnd-kit、Lucide React 与现有 Zod/CodeMirror。直接依赖的发布包采用 MIT、ISC 等宽松开源许可证，不需要许可证密钥、资格认证或年度续期。

`npm run check:licenses` 扫描 lockfile 中所有非 dev 包，只接受当前审核过的宽松许可证表达式。新增其他许可证时检查会失败，必须先人工阅读发布包条款并更新 ADR，不能仅凭项目主页声明放行。

当前非 dev 包许可证分布：

| 许可证 | 包数量 |
|---|---:|
| MIT | 116 |
| BSD-2-Clause | 1 |
| BSD-3-Clause | 3 |
| ISC | 3 |
| 0BSD | 1 |
| Apache-2.0 | 1 |
| MIT OR CC0-1.0 | 1 |

PrimeVue 4 只在旧 Vue 入口迁移期保留，其锁定版本为 MIT；禁止升级到 PrimeVue 5。

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

## 已知安全审计状态

依赖安装阶段 npm 报告 7 个 high severity 项。进一步的 `npm audit` 会向 npm 发送项目依赖清单，本次执行环境未获外发许可，因此尚未取得漏洞归因；不能据此判断问题来自生产依赖或新增 React 栈。获得明确授权后再运行只读审计并记录包名、影响路径和处置结论，禁止直接执行 `npm audit fix --force`。
