# 真实后端本地预览

使用当前工作区的 React 源码连接 `https://ss.vkio.org`，无需部署迁移中的前端：

```text
npm run dev:real-backend
http://127.0.0.1:8787/react#/connect
```

该入口只监听 `127.0.0.1`，固定代理到正式后端，不接受可配置的任意上游。管理员口令由用户直接输入浏览器，不写入仓库、命令行或日志。

安全策略：

- 转发 `GET`、`HEAD`、`OPTIONS`，用于读取 bootstrap、设置、资源、Profile、GitHub sync 与 SRS 状态。
- 只额外转发 `POST /api/login` 和 `POST /api/logout`。
- 阻止设置、文件、Profile、sync、Ruleset build 等持久化或操作性写请求并返回 HTTP 403。
- 不得为方便测试静默放开写请求；真实数据写入需要用户对具体操作重新授权。

验证完成后使用 `Ctrl+C` 停止服务。该工具不替代隔离 staging，也不改变 Worker、Cookie、R2 或 revision 语义。
