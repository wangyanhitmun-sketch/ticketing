# 工单系统 - 项目入口

> 本文件是工单系统项目的渐进式披露入口。后续设计、架构、开发、测试任务应先读取本文件，再按任务读取相关文档。

## 项目定位

工单系统是一个独立闭环的工单管理系统，用于承接需求线索和缺陷线索，完成问题单收集、分流、转工单、工单拆分、叶子工单执行、进度追踪、任务看板和指标统计。

当前阶段先实现工单系统独立闭环。与 GienCoder 智能软件工厂的联动能力放到 P3。

## 核心对象

| 对象 | 定义 |
|---|---|
| 问题单 | 需求线索或缺陷线索的输入对象，不承载研发执行 |
| 工单 | 业务需求、技术需求、缺陷的统一管理对象 |
| 叶子工单 | 研发执行载体，可以分配、推进状态、更新进度 |
| 父工单 | 聚合和管理对象，状态与进度由子工单计算 |
| 视图 | 个人视图或团队视图，保存筛选、分组、排序、字段配置 |
| 指标 | 基于问题单、工单、状态日志、进度日志和来源关系统计 |

## 已确认关键规则

1. Idea 不作为独立对象，统一理解为需求线索或缺陷线索。
2. 工单分类为：业务需求、技术需求、缺陷。
3. 工单最多支持二级结构：父工单、子工单。
4. 只有叶子节点工单作为研发执行载体。
5. 未拆分工单默认是叶子工单。
6. 已拆分父工单仅做聚合、管理和追踪。
7. 问题单与工单是 n:n 关系。
8. 工单来源类型包括：问题单转入、人为创建、缺陷转需求、AI 创建。
9. 缺陷转需求需要记录来源缺陷。
10. 创建工单时如果已指定执行人或团队，则状态进入待开发；否则为待分配。
11. 父工单可在看板中作为关联项显示，但不作为筛选条件。
12. 视图分为个人视图和团队视图，个人视图支持转团队视图。
13. AI 自然语言创建工单放在 P1。
14. AI 智能问题单分流放在 P3。
15. GienCoder 联动放在 P3。

## 状态机

工单统一状态：

```text
待分配 -> 待开发 -> 开发中 -> 已完成
待分配 / 待开发 / 开发中 -> 已取消
已完成 -> 待开发
已取消 -> 待分配 或 待开发（取决于是否仍有执行人/团队）
```

问题单状态：

```text
待分流 -> 已转工单
待分流 -> 已关闭
已关闭 -> 待分流
```

## 父工单计算规则

### 进度

- 父工单进度由子工单进度计算。
- 默认采用子工单等权平均。
- 已取消子工单默认不参与计算。
- 全部子工单已取消时，父工单状态为已取消，进度为 0%。

### 状态

父工单状态采用风险优先规则：

```text
全部取消 => 已取消
存在待分配 => 待分配
不存在待分配，存在待开发 => 待开发
不存在待分配/待开发，存在开发中 => 开发中
所有未取消子工单完成 => 已完成
```

## 分期规划

| 阶段 | 范围 |
|---|---|
| P0 | 问题单收集、人工分流、手动创建工单、叶子工单状态机、基础视图、基础统计 |
| P1 | 工单二级拆分、父工单计算、表格视图、泳道看板、个人视图转团队视图、AI 自然语言创建工单 |
| P2 | 高级统计、周期分析、负载统计、超期识别、数据导出、协同增强 |
| P3 | AI 智能问题单分流、GienCoder 联动 |

## Epic 索引

| Epic | 名称 | 阶段 | 入口 |
|---|---|---|---|
| EPIC-001 | 问题单收集与导入 | P0/P1 | `userstory/EPIC-001-问题单收集与导入/` |
| EPIC-002 | 问题单分流与转工单 | P0/P1 | `userstory/EPIC-002-问题单分流与转工单/` |
| EPIC-003 | 工单创建与基础管理 | P0/P1 | `userstory/EPIC-003-工单创建与基础管理/` |
| EPIC-004 | 工单拆分与父子规则 | P1 | `userstory/EPIC-004-工单拆分与父子规则/` |
| EPIC-005 | 叶子工单执行状态机 | P0/P1 | `userstory/EPIC-005-叶子工单执行状态机/` |
| EPIC-006 | 工单看板与自定义视图 | P0/P1 | `userstory/EPIC-006-工单看板与自定义视图/` |
| EPIC-007 | 需求与缺陷指标统计 | P0/P2 | `userstory/EPIC-007-需求与缺陷指标统计/` |
| EPIC-008 | AI 自然语言创建工单 | P1/P2 | `userstory/EPIC-008-AI自然语言创建工单/` |
| EPIC-009 | AI 智能问题单分流 | P3 | `userstory/EPIC-009-AI智能问题单分流/` |

## 渐进式读取导航

### 继续写 PRD

1. 读取本文件。
2. 读取 `context/current-state.md`。
3. 读取 `PRD/PRD-工单系统-V1.0.md` 或对应章节。
4. 按章节继续，不一次性读取全部 User Story。

### 继续拆 User Story

1. 读取本文件。
2. 读取 `context/current-state.md`。
3. 读取目标 Epic 目录下的 `README.md` 或对应 US 文件。
4. 逐个 US 确认。

### 进入架构设计

1. 读取本文件。
2. 读取 `context/terms.md`、`context/decisions.md`。
3. 读取已确认 PRD 和相关 Epic。
4. 再创建或更新 `architecture/` 下的架构文档。

### 进入开发实现

1. 读取本文件。
2. 读取 `architecture/架构设计.md`、`architecture/数据模型.md`、`architecture/接口设计.md`。
3. 读取 `development/代码实现准备.md`、`development/服务端模块设计.md`、`development/端到端开发实施计划.md`、`development/P0-开发任务拆分.md`。
4. 读取 `development/code-skeleton/domain-types.ts`、`development/code-skeleton/service-interfaces.ts`、`development/code-skeleton/repository-interfaces.ts`。
5. 按最小可验证任务推进代码实现与编译验证。

### 继续前端设计

1. 读取本文件。
2. 读取 `design/前端页面设计与信息架构.md`。
3. 按页面、组件、交互状态或原型任务继续细化。

## 当前进展

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
- 当前“数据库 DDL 草案 + OpenAPI 草案”目标已完成。
- 已生成代码实现准备文档与 TypeScript 领域类型/服务接口骨架：`development/代码实现准备.md`、`development/code-skeleton/domain-types.ts`、`development/code-skeleton/service-interfaces.ts`。
- 已完成前端页面设计与信息架构：`design/前端页面设计与信息架构.md`。
- 已完成服务端模块设计：`development/服务端模块设计.md`。
- 已完成 Repository 接口骨架：`development/code-skeleton/repository-interfaces.ts`。
- 已完成端到端开发实施计划：`development/端到端开发实施计划.md`。
- 当前“前端页面设计 / 信息架构 + 服务端模块设计 / Repository 接口骨架”目标已完成。
- 下一步可确认实际技术栈与工程目录，进入代码实现或 HTML 原型设计。

## 输出约定

- 本项目所有文档都放在 `/Users/estelle/工作-中电2025/07-Workspace/08-projects/工单系统/` 下。
- 文档命名优先使用中文语义，必要时保留 Epic / US 编号。
- 重要决策沉淀到 `context/decisions.md`。
- 当前状态沉淀到 `context/current-state.md`。
- 术语和口径沉淀到 `context/terms.md`。
