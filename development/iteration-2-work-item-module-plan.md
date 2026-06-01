# Iteration 2 Work Item Module Implementation Plan

> **Goal:** Build the P0 work item module minimum closed loop: manually create business requirement, technical requirement, and defect work items; update work item; list work items; view work item detail.
>
> **Required method:** TDD. For every behavior: RED -> GREEN -> REFACTOR. No production code without a failing test first.

## Scope

### In Scope

- Manual work item creation API: `POST /work-items`.
- Work item update API: `PUT /work-items/{workItemId}`.
- Work item list API: `GET /work-items`.
- Work item detail API: `GET /work-items/{workItemId}`.
- Three work item types: `business_requirement`, `technical_requirement`, `defect`.
- Initial status calculation:
  - `assigneeId` or `teamId` present => `ready_for_dev`.
  - no execution subject => `unassigned`.
  - `ownerId` alone does not count as execution subject.
- Manual creation defaults:
  - `sourceType = manual`.
  - `level = 1`.
  - `isLeaf = true`.
  - `parentId = null`.
  - `progress = 0`.
- Status log recording for create.
- Audit log recording for create and update.
- Basic validation and domain errors.
- Frontend work item API client and module shell.
- Iteration 2 verifier and smoke checklist.

### Out of Scope

- Issue triage to work item; planned for Iteration 3.
- Work item execution workflow actions: assign/start/progress/complete/cancel; planned for Iteration 4.
- Two-level split and parent work item calculation; later iteration / P1.
- Defect-to-requirement conversion; P1.
- PostgreSQL production repository implementation; keep in-memory repository behind a replaceable boundary in this iteration.
- Permission enforcement and real authentication; leave request context placeholder for later hardening.

## File Structure

### Backend files

| File | Action | Responsibility |
|---|---|---|
| `apps/api/src/work-items/work-item-types.ts` | Create | DTOs, query types, detail shape. |
| `apps/api/src/work-items/work-item-policy.ts` | Create | Pure validation, initial status, immutable-field checks. |
| `apps/api/src/work-items/work-item-policy.test.ts` | Create | TDD tests for validation and creation rules. |
| `apps/api/src/work-items/work-item-repository.ts` | Create | In-memory work item repository, status/progress/audit logs. |
| `apps/api/src/work-items/work-item-repository.test.ts` | Create | TDD tests for create/update/list/detail/log behavior. |
| `apps/api/src/work-items/work-item-service.ts` | Create | Application service for create/update/list/get. |
| `apps/api/src/work-items/work-item-service.test.ts` | Create | Business behavior and error paths. |
| `apps/api/src/work-items/work-item-routes.ts` | Create | Express route registration for `/work-items`. |
| `apps/api/src/work-items/work-item-routes.test.ts` | Create | Direct route tests without listening on a port. |
| `apps/api/src/app.ts` | Modify | Register work item routes. |
| `apps/api/src/shared/errors.ts` | Modify | Add `WORK_ITEM_STATUS_INVALID` if needed. |

### Frontend files

| File | Action | Responsibility |
|---|---|---|
| `apps/web/src/api/work-items.ts` | Create | Work item API client methods and response types. |
| `apps/web/src/work-items/WorkItemPage.tsx` | Create | Work item module shell with list/new/detail affordances. |
| `apps/web/src/main.tsx` | Modify | Render work item module shell. |
| `apps/web/src/styles.css` | Modify | Work item shell styles. |

### Verification files

| File | Action | Responsibility |
|---|---|---|
| `development/iteration-2-work-item-module-plan.md` | Create | This implementation plan and TDD checklist. |
| `scripts/verify-iteration2.mjs` | Create | Verifies Iteration 2 files, routes and scripts exist. |
| `tests/e2e/iteration-2-work-item-smoke.spec.md` | Create | Manual/E2E smoke checklist until browser automation is installed. |
| `package.json` | Modify | Add `test:iteration2` and `verify:iteration2`. |
| `PROJECT.md`, `context/current-state.md`, `README.md` | Modify | Update completion status after final verification. |

## Target API Behavior

### Create Work Item

Request shape:

```ts
{
  type: 'business_requirement' | 'technical_requirement' | 'defect';
  title: string;
  description: string;
  priority?: 'P0' | 'P1' | 'P2' | 'P3';
  ownerId?: string | null;
  assigneeId?: string | null;
  teamId?: string | null;
  dueDate?: string | null;
  impactScope?: string;
  businessCategory?: string;
  technicalCategory?: string;
  severity?: string;
  acceptanceCriteria?: string;
  completionCriteria?: string;
  riskNote?: string;
  expectedResult?: string;
  actualResult?: string;
  reproduceSteps?: string;
}
```

Expected result:

```ts
{
  id: string;
  workItemNo: string;
  type: 'business_requirement' | 'technical_requirement' | 'defect';
  sourceType: 'manual';
  status: 'unassigned' | 'ready_for_dev';
  progress: 0;
  level: 1;
  isLeaf: true;
}
```

Rules:

- `type`, `title`, `description` are required.
- `type` must be one of the three confirmed work item categories.
- Blank `title` or `description` returns `VALIDATION_ERROR`.
- Default `priority = P2`.
- Default `sourceType = manual`.
- Default `level = 1`, `isLeaf = true`, `parentId = null`, `progress = 0`.
- Initial status uses execution subject only:
  - `assigneeId` or `teamId` => `ready_for_dev`.
  - otherwise => `unassigned`.
  - `ownerId` alone => `unassigned`.
- Write one status log with `toStatus = initialStatus`.
- Write one audit log with `action = work_item.created`.

### Update Work Item

Rules:

- Only existing work items can be updated.
- Editable fields: title, description, priority, ownerId, assigneeId, teamId, dueDate, and type-specific extension fields.
- Immutable through generic update: type, sourceType, sourceDefectId, aiCreationId, status, progress, parentId, level, isLeaf.
- Update does not change status/progress.
- Write audit log with `action = work_item.updated`.

### List Work Items

Rules:

- Supports `keyword`, `type`, `status`, `sourceType`, `priority`, `ownerId`, `assigneeId`, `teamId`, `isLeaf`, `createdFrom`, `createdTo`, `page`, `pageSize`.
- Default pagination: `page = 1`, `pageSize = 20`.
- Sort by newest `createdAt` first, then newest `workItemNo` first.
- Response shape includes `items` and `total`.

### Get Work Item Detail

Rules:

- Returns base work item fields.
- Returns `statusLogs`.
- Returns `progressLogs`, empty array for Iteration 2.
- Returns `sourceIssues`, empty array for manual work items in Iteration 2.
- Returns `children`, empty array for Iteration 2.
- Returns `parent`, null for Iteration 2 manual top-level work items.

## TDD Test Checklist

### Policy Tests

- [ ] `validateCreateWorkItemInput rejects blank title`.
- [ ] `validateCreateWorkItemInput rejects blank description`.
- [ ] `validateCreateWorkItemInput rejects invalid type`.
- [ ] `validateCreateWorkItemInput accepts business requirement`.
- [ ] `validateCreateWorkItemInput accepts technical requirement`.
- [ ] `validateCreateWorkItemInput accepts defect`.
- [ ] `getInitialWorkItemStatus returns unassigned without assignee or team`.
- [ ] `getInitialWorkItemStatus returns ready_for_dev with assignee`.
- [ ] `getInitialWorkItemStatus returns ready_for_dev with team`.
- [ ] `getInitialWorkItemStatus ignores owner only`.
- [ ] `assertNoImmutableWorkItemFields rejects type changes`.
- [ ] `assertNoImmutableWorkItemFields rejects status changes`.

### Repository Tests

- [ ] `create stores work item with generated id and number`.
- [ ] `create stores manual source defaults`.
- [ ] `update changes editable fields without changing status or progress`.
- [ ] `findById returns null for missing work item`.
- [ ] `list filters by type`.
- [ ] `list filters by status`.
- [ ] `list filters by source type`.
- [ ] `list filters by assignee and team`.
- [ ] `list filters by keyword in title and description`.
- [ ] `list paginates results`.
- [ ] `createStatusLog stores work item status log`.
- [ ] `createAuditLog stores work item audit log`.

### Service Tests

- [ ] `createWorkItem creates business requirement with manual source and status log`.
- [ ] `createWorkItem creates technical requirement`.
- [ ] `createWorkItem creates defect`.
- [ ] `createWorkItem sets ready_for_dev when assignee exists`.
- [ ] `createWorkItem keeps unassigned when only owner exists`.
- [ ] `createWorkItem rejects blank title`.
- [ ] `updateWorkItem updates editable fields and writes audit log`.
- [ ] `updateWorkItem rejects immutable type change`.
- [ ] `listWorkItems returns filtered page`.
- [ ] `getWorkItem returns detail with status logs and empty source/progress/children`.

### Route Tests

- [ ] `POST /work-items returns created business requirement envelope`.
- [ ] `POST /work-items returns created technical requirement envelope`.
- [ ] `POST /work-items returns created defect envelope`.
- [ ] `POST /work-items returns validation error for blank title`.
- [ ] `GET /work-items returns paged work items envelope`.
- [ ] `GET /work-items/:workItemId returns detail envelope`.
- [ ] `PUT /work-items/:workItemId returns updated detail envelope`.
- [ ] `PUT /work-items/:workItemId returns validation error for immutable type change`.

## Implementation Tasks

1. **Task 0: Commit this Iteration 2 plan.**
2. **Task 1: Work item policy and DTOs.** RED tests first, then validation and initial status implementation.
3. **Task 2: In-memory work item repository.** RED tests first, then create/update/list/log storage.
4. **Task 3: Work item application service.** RED tests first, then orchestration and error paths.
5. **Task 4: Work item API routes.** RED tests first, then Express route registration.
6. **Task 5: Contract and frontend shell.** Sync OpenAPI, add API client and page shell.
7. **Task 6: Iteration 2 verification.** Add scripts, smoke checklist, docs, run full regression.

## Final Verification Commands

```bash
npm run check
npm run build
npm run test:iteration0
npm run verify:iteration0
npm run test:iteration1
npm run verify:iteration1
npm run test:iteration2
npm run verify:iteration2
```
