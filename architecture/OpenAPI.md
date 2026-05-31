# OpenAPI 草案 - 工单系统 P0

> 文档路径：`/Users/estelle/工作-中电2025/07-Workspace/08-projects/工单系统/architecture/OpenAPI.md`
>
> YAML 文件：`architecture/openapi/P0-openapi.yaml`
>
> 状态：草案
>
> 更新日期：2026-05-30

---

## 1. 说明

本 OpenAPI 草案基于以下文档生成：

- `PRD/P0-MVP-范围冻结稿.md`
- `architecture/接口设计.md`
- `architecture/数据模型.md`
- `architecture/状态机设计.md`

覆盖 P0.1 核心 API：

- 问题单创建、编辑、列表、详情、关闭。
- 问题单转业务需求、技术需求、缺陷。
- 三类工单手动创建、编辑、列表、详情。
- 叶子工单状态动作：分配、开始处理、更新进度、完成、取消。
- 基础指标、工单分类统计、工单状态分布统计。

---

## 2. OpenAPI 文件

完整 YAML 位于：

`/Users/estelle/工作-中电2025/07-Workspace/08-projects/工单系统/architecture/openapi/P0-openapi.yaml`

---

## 3. API 分组

| 分组 | 路径前缀 | 说明 |
|---|---|---|
| Issues | `/api/issues` | 问题单创建、编辑、查询、关闭 |
| Triage | `/api/issues/{issueId}/triage/*` | 问题单转三类工单 |
| WorkItems | `/api/work-items` | 工单创建、编辑、查询 |
| WorkItemActions | `/api/work-items/{workItemId}/*` | 叶子工单状态动作 |
| Metrics | `/api/metrics` | P0 基础统计 |

---

## 4. P0 接口清单

### 问题单

| 方法 | 路径 | 说明 |
|---|---|---|
| POST | `/api/issues` | 创建问题单 |
| GET | `/api/issues` | 查询问题单列表 |
| GET | `/api/issues/{issueId}` | 查询问题单详情 |
| PUT | `/api/issues/{issueId}` | 编辑问题单 |
| POST | `/api/issues/{issueId}/close` | 关闭问题单 |

### 分流

| 方法 | 路径 | 说明 |
|---|---|---|
| POST | `/api/issues/{issueId}/triage/business-requirement` | 问题单转业务需求 |
| POST | `/api/issues/{issueId}/triage/technical-requirement` | 问题单转技术需求 |
| POST | `/api/issues/{issueId}/triage/defect` | 问题单转缺陷 |

### 工单

| 方法 | 路径 | 说明 |
|---|---|---|
| POST | `/api/work-items` | 创建工单 |
| GET | `/api/work-items` | 查询工单列表 |
| GET | `/api/work-items/{workItemId}` | 查询工单详情 |
| PUT | `/api/work-items/{workItemId}` | 编辑工单 |

### 工单动作

| 方法 | 路径 | 说明 |
|---|---|---|
| POST | `/api/work-items/{workItemId}/assign` | 分配叶子工单 |
| POST | `/api/work-items/{workItemId}/start` | 开始处理叶子工单 |
| POST | `/api/work-items/{workItemId}/progress` | 更新叶子工单进度 |
| POST | `/api/work-items/{workItemId}/complete` | 完成叶子工单 |
| POST | `/api/work-items/{workItemId}/cancel` | 取消叶子工单 |

### 统计

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/api/metrics/summary` | 基础指标统计 |
| GET | `/api/metrics/work-item-types` | 工单分类统计 |
| GET | `/api/metrics/work-item-status` | 工单状态分布统计 |

---

## 5. 通用约定

### 响应格式

所有接口使用统一响应：

```json
{
  "success": true,
  "data": {},
  "error": null,
  "requestId": "req_xxx"
}
```

失败响应：

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "WORK_ITEM_STATUS_INVALID",
    "message": "当前状态不允许执行该操作",
    "details": {}
  },
  "requestId": "req_xxx"
}
```

### 幂等

以下接口支持 `Idempotency-Key`：

- 问题单转业务需求。
- 问题单转技术需求。
- 问题单转缺陷。
- 手动创建工单。

---

## 6. 待落地确认

1. 是否使用 `/api` 作为统一前缀。
2. 是否需要将用户、团队接口纳入本 OpenAPI。
3. 是否需要拆分为前端 BFF API 与后端领域 API。
4. 是否需要生成 JSON Schema 或 TypeScript 类型。
5. 是否需要加入认证方式，例如 Bearer Token / Cookie Session。

