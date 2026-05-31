# Iteration 0 E2E Smoke Spec

手工或自动化 E2E 最小冒烟范围：

1. 启动 `npm run dev:web`。
2. 打开 Web 首页。
3. 确认页面展示 `Ticketing`、`工作台`、`问题单`、`工单`、`统计`。
4. 启动 `npm run dev:api`。
5. 访问 `GET /health`，确认返回 `ticketing-api` 与 `ok`。

当前仓库已准备 Vite 前端壳和 Express API 健康检查；浏览器自动化将在后续 E2E 框架接入时落地。
