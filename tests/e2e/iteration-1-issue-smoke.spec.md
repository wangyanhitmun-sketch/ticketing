# Iteration 1 问题单最小闭环 Smoke Checklist

> 当前仓库尚未引入浏览器 E2E 自动化，本文件作为 Iteration 1 的手工 / 后续自动化验收清单。

## API Smoke

- [ ] `POST /issues` 使用标题和描述创建问题单，返回 `success=true`、`status=pending_triage`。
- [ ] `POST /issues` 标题为空时返回 `VALIDATION_ERROR`。
- [ ] `GET /issues` 返回 `items` 与 `total`。
- [ ] `GET /issues/:issueId` 返回问题单详情、`statusLogs`、空 `relatedWorkItems`。
- [ ] `PUT /issues/:issueId` 可更新待分流问题单标题或描述。
- [ ] `POST /issues/:issueId/close` 可使用 `closeReasonType` 或 `closeReason` 关闭问题单。
- [ ] 已关闭或已转工单的问题单不能再次关闭或编辑。

## Frontend Smoke

- [ ] 前端首页显示“问题单收集与关闭”模块。
- [ ] 页面显示“新建问题单”入口。
- [ ] 页面显示问题单列表区域。
- [ ] 页面显示空状态说明。
- [ ] 移动端宽度下列表与操作区不溢出。

## Known Limitations

- Iteration 1 使用内存仓储，服务重启后数据会丢失。
- Iteration 1 不包含问题单转工单、附件、评论、权限、真实用户上下文。
- 前端先提供模块壳与 API client，真实接口联调和表单交互在后续迭代继续增强。
