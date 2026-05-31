# 当前状态 - 工单系统

## 最近确认

- 工单系统文档统一放在 `/Users/estelle/工作-中电2025/07-Workspace/08-projects/工单系统/`。
- 已完成 PRD 概述、用户画像、业务实体图、业务流程时序图、用户故事依赖图。
- 已完成 9 个 Epic、72 个 User Story 的会话级拆分。
- 已完成 PRD 精修稿：`PRD/PRD-工单系统-V1.0.md`。
- 已完成 User Story 拆分稿：`userstory/USER-STORY-工单系统-V1.0.md`。
- 已完成 P0 MVP 范围冻结稿：`PRD/P0-MVP-范围冻结稿.md`。
- 已完成架构设计初稿：`architecture/架构设计.md`。
- 已完成数据模型设计：`architecture/数据模型.md`。
- 已完成状态机设计：`architecture/状态机设计.md`。
- 已完成权限模型设计：`architecture/权限模型.md`。
- 已完成接口设计初稿：`architecture/接口设计.md`。
- 已完成 P0 开发任务拆分：`development/P0-开发任务拆分.md`。
- 已完成 P0 测试方案：`testing/P0-测试方案.md`。
- 已完成数据库 DDL 草案：`architecture/数据库DDL.md` 与 `architecture/sql/P0-schema-postgresql.sql`。
- 已完成 OpenAPI 草案：`architecture/OpenAPI.md` 与 `architecture/openapi/P0-openapi.yaml`。
- 已完成代码实现准备文档：`development/代码实现准备.md`。
- 已完成 TypeScript 领域类型骨架：`development/code-skeleton/domain-types.ts`。
- 已完成服务接口骨架：`development/code-skeleton/service-interfaces.ts`。
- 已完成前端页面设计与信息架构：`design/前端页面设计与信息架构.md`。
- 已完成服务端模块设计：`development/服务端模块设计.md`。
- 已完成 Repository 接口骨架：`development/code-skeleton/repository-interfaces.ts`。
- 已完成端到端开发实施计划：`development/端到端开发实施计划.md`。

## 已确认关键口径

1. 工单系统先独立闭环，GienCoder 联动放到 P3。
2. Idea 不作为独立对象，统一归为需求线索或缺陷线索，承载于问题单。
3. 工单分类为业务需求、技术需求、缺陷。
4. 工单最多支持二级结构。
5. 叶子工单是研发执行载体。
6. 工单来源类型为问题单转入、人为创建、缺陷转需求、AI 创建。
7. 缺陷转需求需要记录来源缺陷。
8. 创建时指定执行人 / 团队则进入待开发，否则待分配。
9. 父工单可在看板中显示但不作为筛选条件。
10. 视图分个人视图和团队视图，个人视图支持转团队视图。
11. AI 自然语言创建工单放 P1。
12. AI 智能问题单分流放 P3。

## 当前文档

- `PROJECT.md`：项目入口和渐进式读取导航。
- `context/terms.md`：术语表。
- `context/decisions.md`：决策记录。
- `PRD/PRD-工单系统-V1.0.md`：PRD 精修稿。
- `userstory/USER-STORY-工单系统-V1.0.md`：User Story 拆分稿。
- `PRD/P0-MVP-范围冻结稿.md`：P0 MVP 范围冻结稿。
- `architecture/架构设计.md`：架构设计初稿。
- `architecture/数据模型.md`：数据模型设计。
- `architecture/状态机设计.md`：状态机设计。
- `architecture/权限模型.md`：权限模型设计。
- `architecture/接口设计.md`：接口设计初稿。
- `development/P0-开发任务拆分.md`：P0 开发任务拆分。
- `testing/P0-测试方案.md`：P0 测试方案。
- `architecture/数据库DDL.md`：数据库 DDL 草案说明。
- `architecture/sql/P0-schema-postgresql.sql`：PostgreSQL DDL 草案。
- `architecture/OpenAPI.md`：OpenAPI 草案说明。
- `architecture/openapi/P0-openapi.yaml`：P0 OpenAPI YAML 草案。
- `development/代码实现准备.md`：代码实现准备说明。
- `development/code-skeleton/domain-types.ts`：TypeScript 领域类型骨架。
- `development/code-skeleton/service-interfaces.ts`：服务接口骨架。
- `design/前端页面设计与信息架构.md`：前端导航、页面结构、信息架构、关键交互和验收清单。
- `development/服务端模块设计.md`：服务端分层、模块边界、核心事务、Repository 依赖和扩展点。
- `development/code-skeleton/repository-interfaces.ts`：Repository 层 TypeScript 接口骨架。
- `development/端到端开发实施计划.md`：前端、后端、数据库、测试串联后的可执行迭代计划。

## 下一步建议

1. 确认实际技术栈与工程目录。
2. 进入代码实现，优先读取 `PROJECT.md`、`development/端到端开发实施计划.md`、`development/代码实现准备.md`、`development/服务端模块设计.md`、`architecture/sql/P0-schema-postgresql.sql`、`architecture/openapi/P0-openapi.yaml`、`development/code-skeleton/domain-types.ts`、`development/code-skeleton/service-interfaces.ts`、`development/code-skeleton/repository-interfaces.ts`。
3. 如继续产品表达，可基于 `design/前端页面设计与信息架构.md` 生成 HTML 原型。
