# Ticketing 工单系统

Ticketing 是一个独立闭环的工单管理系统，用于承接需求线索和缺陷线索，完成问题单收集、人工分流、转工单、工单创建、叶子工单执行、进度追踪、任务看板和指标统计。

当前阶段优先实现工单系统自身闭环；与 GienCoder 智能软件工厂的端到端联动放到 P3。

## 当前状态

本仓库当前已完成 P0/P1/P2/P3 的产品与技术设计资产沉淀，并已完成 Iteration 0 工程基线、Iteration 1 问题单模块最小闭环、Iteration 2 工单基础闭环和 Iteration 3 分流与来源追溯实现。

已完成内容包括：

- PRD 与 P0 MVP 范围冻结。
- 9 个 Epic 与 User Story 拆分。
- 总体架构、数据模型、状态机、权限模型、接口设计。
- PostgreSQL DDL 草案与 OpenAPI 草案。
- 前端页面设计与信息架构。
- 服务端模块设计、领域类型、服务接口、Repository 接口骨架。
- P0 开发任务拆分、端到端开发实施计划、测试方案。
- Iteration 0：TypeScript monorepo、API / Web / Contracts / Domain 基线、数据库脚本 dry-run、验证脚本。
- Iteration 1：问题单创建、编辑、列表、详情、关闭；后端 Policy / Repository / Service / Routes；前端 API client 与问题单页面壳。
- Iteration 2：业务需求、技术需求、缺陷三类工单手动创建、编辑、列表、详情；后端 Policy / Repository / Service / Routes；前端 API client 与工单页面壳。
- Iteration 3：问题单人工转业务需求、技术需求、缺陷；问题单与工单 n:n 来源关系；问题单详情关联工单；工单详情来源问题单；OpenAPI 契约、前端 API client、验证脚本与 Smoke 清单。

## 核心口径

- 问题单是需求线索或缺陷线索的输入对象，不承载研发执行。
- 工单分类为业务需求、技术需求、缺陷。
- 工单来源类型包括问题单转入、人为创建、缺陷转需求、AI 创建。
- 问题单与工单是 n:n 关系，需要保留来源追溯。
- 工单最多支持二级结构：父工单、子工单。
- 只有叶子工单作为研发执行载体。
- 未拆分工单默认是叶子工单。
- 父工单只做聚合、管理和追踪，状态与进度由子工单计算。
- AI 自然语言创建工单放在 P1。
- AI 智能问题单分流与 GienCoder 联动放在 P3。

## 文档导航

建议从 `PROJECT.md` 开始阅读，它是本项目的渐进式披露入口。

| 目录 / 文件 | 说明 |
|---|---|
| `PROJECT.md` | 项目入口、关键规则、分期规划、阅读导航 |
| `context/` | 当前状态、关键决策、术语表 |
| `PRD/` | PRD 精修稿与 P0 MVP 范围冻结稿 |
| `userstory/` | Epic 与 User Story 拆分 |
| `architecture/` | 架构、数据模型、状态机、权限、接口、DDL、OpenAPI |
| `design/` | 前端页面设计与信息架构 |
| `development/` | 开发任务拆分、代码实现准备、服务端模块设计、端到端实施计划、代码骨架 |
| `testing/` | P0 测试方案 |

## 推荐开发路径

进入代码实现前，优先阅读：

1. `PROJECT.md`
2. `development/端到端开发实施计划.md`
3. `development/代码实现准备.md`
4. `development/服务端模块设计.md`
5. `architecture/sql/P0-schema-postgresql.sql`
6. `architecture/openapi/P0-openapi.yaml`
7. `development/code-skeleton/domain-types.ts`
8. `development/code-skeleton/service-interfaces.ts`
9. `development/code-skeleton/repository-interfaces.ts`

P0 建议按以下迭代推进：

1. Iteration 0：工程与契约基线。
2. Iteration 1：问题单最小闭环。
3. Iteration 2：工单基础闭环。
4. Iteration 3：分流与来源追溯。
5. Iteration 4：状态机与进度跟踪。
6. Iteration 5：工作台、筛选与统计。
7. Iteration 6：权限、审计与验收加固。


## Iteration 0 快速验证

```bash
npm run check
npm run build
npm run verify:iteration0
npm run db:migrate -- --dry-run
npm run db:seed -- --dry-run
```

启动开发服务：

```bash
npm run dev:api
npm run dev:web
```

> 如果没有本地 PostgreSQL，可先使用 `--dry-run` 验证数据库脚本；设置 `DATABASE_URL` 后再真实执行 migration 和 seed。

## Iteration 1 快速验证

```bash
npm run test:iteration1
npm run verify:iteration1
npm run check
```

Iteration 1 当前使用内存仓储，适合先验证问题单行为闭环；持久化 Repository、权限、附件、评论、问题单转工单将在后续迭代继续实现。

## Iteration 2 快速验证

```bash
npm run test:iteration2
npm run verify:iteration2
npm run check
```

Iteration 2 当前使用内存仓储，适合先验证三类工单基础行为闭环；问题单转工单、执行状态机、持久化 Repository 和权限将在后续迭代继续实现。

## Iteration 3 快速验证

```bash
npm run test:iteration3
npm run verify:iteration3
npm run check
```

Iteration 3 当前使用内存仓储，适合先验证问题单人工分流与来源追溯闭环；执行状态机、进度跟踪、持久化 Repository 和权限将在后续迭代继续实现。

## 本地 Python 环境

本目录已准备本地 Python 虚拟环境 `.venv`，用于运行 YAML 校验、脚本工具或后续辅助任务。

```bash
source .venv/bin/activate
python -c "import yaml; print(yaml.__version__)"
```

`.venv/` 已加入 `.gitignore`，不会提交到仓库。

## Git 忽略策略

`.gientech/` 是本地 AI 协作治理与运行目录，包含 runtime、logs、hooks、skills 等内容。当前仓库将其整体加入 `.gitignore`，不纳入项目提交。

## License

当前项目按内部 / 私有项目处理，暂不声明开源 License。
