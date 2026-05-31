# 数据库 DDL 草案 - 工单系统 P0

> 文档路径：`/Users/estelle/工作-中电2025/07-Workspace/08-projects/工单系统/architecture/数据库DDL.md`
>
> SQL 文件：`architecture/sql/P0-schema-postgresql.sql`
>
> 状态：草案
>
> 更新日期：2026-05-30

---

## 1. 说明

本 DDL 草案基于 `architecture/数据模型.md` 生成，目标数据库为 PostgreSQL 14+。

覆盖范围：

- P0.1 核心表。
- P0.2/P1 预留表。
- 基础索引、唯一约束、check 约束。
- `updated_at` 自动更新时间触发器。

---

## 2. SQL 文件

完整 SQL 位于：

`/Users/estelle/工作-中电2025/07-Workspace/08-projects/工单系统/architecture/sql/P0-schema-postgresql.sql`

---

## 3. 表清单

### P0.1 核心表

| 表 | 说明 |
|---|---|
| teams | 团队 |
| users | 用户 |
| issues | 问题单 |
| issue_status_logs | 问题单状态日志 |
| work_items | 工单 |
| issue_work_item_sources | 问题单-工单来源关系 |
| work_item_relations | 工单间关系，P1 主要使用 |
| work_item_status_logs | 工单状态日志 |
| work_item_progress_logs | 工单进度日志 |
| attachments | 附件 |
| comments | 评论 |
| audit_logs | 审计日志 |

### P0.2/P1/P3 预留表

| 表 | 说明 |
|---|---|
| issue_import_tasks | 问题单导入任务，P0.2 |
| view_configs | 个人/团队视图，P0.2/P1 |
| ai_creation_records | AI 创建工单记录，P1 |
| ai_triage_suggestions | AI 问题单分流建议，P3 |

---

## 4. 关键约束

### 问题单

- `title`、`description` 必填。
- `status` 限制为 `pending_triage`、`converted`、`closed`。
- `clue_type` 限制为 `demand_clue`、`defect_clue`、`unknown`。
- 已关闭问题单必须有关闭原因类型或关闭说明。

### 工单

- `type` 限制为 `business_requirement`、`technical_requirement`、`defect`。
- `source_type` 限制为 `issue_converted`、`manual`、`defect_to_requirement`、`ai_created`。
- `status` 限制为 `unassigned`、`ready_for_dev`、`in_progress`、`completed`、`canceled`。
- `progress` 限制为 0-100。
- 已完成工单 `progress=100`。
- 已取消工单必须有取消原因类型或取消说明。
- `parent_id` 与 `level` 保持一致：无父工单为一级，有父工单为二级。

### 来源关系

- `issue_id + work_item_id` 唯一，避免同一问题单和工单重复关联。
- `work_item_relations` 中 `source_work_item_id + target_work_item_id + relation_type` 唯一。

---

## 5. 待落地确认

1. 最终技术栈是否使用 PostgreSQL。
2. 用户和团队是否复用已有系统账户表。
3. 编号生成是否由数据库、服务端或编号服务负责。
4. 附件是否落对象存储，`file_url` 是否需要改为 file_key。
5. 枚举是否使用数据库 enum，当前草案采用 varchar + check。
6. P0 是否启用附件、评论表的前端能力。

