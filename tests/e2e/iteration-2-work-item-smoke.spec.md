# Iteration 2 工单基础闭环 Smoke Checklist

> 当前仓库尚未引入浏览器 E2E 自动化，本文件作为 Iteration 2 的手工 / 后续自动化验收清单。

## API Smoke

- [ ] `POST /work-items` 可以创建业务需求，返回 `sourceType=manual`、`level=1`、`isLeaf=true`。
- [ ] `POST /work-items` 可以创建技术需求。
- [ ] `POST /work-items` 可以创建缺陷。
- [ ] 未指定 `assigneeId` / `teamId` 时，初始状态为 `unassigned`。
- [ ] 指定 `assigneeId` 或 `teamId` 时，初始状态为 `ready_for_dev`。
- [ ] 仅指定 `ownerId` 时，初始状态仍为 `unassigned`。
- [ ] `GET /work-items` 返回 `items` 与 `total`。
- [ ] `GET /work-items/:workItemId` 返回工单详情、状态日志、空来源问题单、空进度日志、空子工单。
- [ ] `PUT /work-items/:workItemId` 可更新标题、描述、优先级和执行主体等可编辑字段。
- [ ] `PUT /work-items/:workItemId` 不允许修改 `type`、`sourceType`、`status`、`progress`、`parentId`、`level`、`isLeaf`。

## Frontend Smoke

- [ ] 前端首页显示“三类工单创建与管理”模块。
- [ ] 页面显示“新建工单”入口。
- [ ] 页面展示业务需求、技术需求、缺陷三类示例卡片。
- [ ] 移动端宽度下工单卡片不溢出。

## Known Limitations

- Iteration 2 使用内存仓储，服务重启后数据会丢失。
- Iteration 2 不包含问题单转工单、工单执行状态动作、二级拆分、缺陷转需求、权限和持久化 Repository。
- 前端先提供模块壳与 API client，真实表单交互在后续迭代继续增强。
