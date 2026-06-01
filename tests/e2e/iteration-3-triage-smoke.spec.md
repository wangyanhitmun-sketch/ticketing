# Iteration 3 问题单分流与来源追溯 Smoke Checklist

> 当前仓库尚未引入浏览器 E2E 自动化，本文件作为 Iteration 3 的手工 / 后续自动化验收清单。

## API Smoke

- [ ] `POST /issues` 可以创建 `pending_triage` 问题单。
- [ ] `POST /issues/:issueId/triage/business-requirement` 可以把待分流问题单转为业务需求工单。
- [ ] `POST /issues/:issueId/triage/technical-requirement` 可以把待分流问题单转为技术需求工单。
- [ ] `POST /issues/:issueId/triage/defect` 可以把待分流问题单转为缺陷工单。
- [ ] 分流创建的工单返回 `sourceType=issue_converted`、`level=1`、`isLeaf=true`、`progress=0`。
- [ ] 分流后问题单状态变为 `converted`。
- [ ] 分流时未传标题、描述、优先级、影响范围时，可以从问题单继承默认值。
- [ ] 转缺陷时未传预期结果、实际结果、复现步骤时，可以从问题单继承默认值。
- [ ] 已转工单或已关闭问题单再次分流时返回状态冲突错误。
- [ ] `GET /issues/:issueId` 返回 `relatedWorkItems`。
- [ ] `GET /work-items/:workItemId` 返回 `sourceIssues`。

## Frontend Smoke

- [ ] 问题单页面展示分流动作提示：转业务需求、转技术需求、转缺陷。
- [ ] 问题单列表行展示三类分流动作入口文案。
- [ ] 移动端宽度下分流动作不导致列表行横向溢出。

## Traceability Smoke

- [ ] 从问题单详情可以看到被分流生成的工单摘要。
- [ ] 从工单详情可以看到来源问题单摘要。
- [ ] 同一个问题单和工单之间不会重复创建相同来源关系。

## Known Limitations

- Iteration 3 使用内存仓储，服务重启后来源关系会丢失。
- Iteration 3 只支持待分流问题单新建工单式分流，不支持关联既有工单。
- Iteration 3 不包含 AI 智能分流、权限校验、幂等键持久化和 PostgreSQL Repository。
- 前端先提供分流入口文案和 API client，真实弹窗表单与详情交互在后续迭代继续增强。
