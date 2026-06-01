# Iteration 1 Issue Module Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the P0 issue module minimum closed loop: create issue, update issue, list issues, view issue detail, and close issue.

**Architecture:** Implement IssueModule as a vertical slice in `apps/api`: domain policy, in-memory repository for first executable tests, application service, and Express routes. Keep PostgreSQL repository as a later replacement behind the same service boundary; Iteration 1 tests must prove behavior before implementation code is written.

**Tech Stack:** Node.js, TypeScript, Express, Node built-in test runner, Vite/React frontend shell, OpenAPI contract in `packages/contracts/openapi.yaml`.

---

## Harness / TDD Requirements

- Harness skill source: `.gientech/skills/writing-plans/SKILL.md` and `.gientech/skills/test-driven-development/SKILL.md`.
- TDD rule: `NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST`.
- For every behavior below, execute RED -> GREEN -> REFACTOR:
  1. Write the smallest failing test.
  2. Run the specific test and verify it fails for the expected reason.
  3. Write minimal implementation.
  4. Run the specific test and verify it passes.
  5. Run `npm run check` before commit.
- If a test passes before implementation, rewrite the test because it is not proving new behavior.

---

## Scope

### In Scope

- Issue creation API: `POST /issues`.
- Issue update API: `PUT /issues/{issueId}`.
- Issue list API: `GET /issues`.
- Issue detail API: `GET /issues/{issueId}`.
- Issue close API: `POST /issues/{issueId}/close`.
- Issue status log recording for create and close.
- Audit log recording for create, update, close.
- Basic validation and domain errors.
- Frontend issue page route shell and API client methods.
- Test-first implementation plan and test checklist.

### Out of Scope

- Problem triage to work item. This starts in Iteration 3.
- PostgreSQL production repository implementation. Iteration 1 can use an in-memory repository to finish behavior-first vertical slice; repository interface must allow PostgreSQL replacement.
- Authentication and real permission enforcement. Use `createAnonymousRequestContext` / test context and leave full data scope to Iteration 6.
- Attachments and comments.
- Batch import.

---

## File Structure

### Backend files

| File | Action | Responsibility |
|---|---|---|
| `apps/api/src/issues/issue-types.ts` | Create | Issue DTOs, query types, detail shape, domain error codes. |
| `apps/api/src/issues/issue-policy.ts` | Create | Pure validation and state transition checks. |
| `apps/api/src/issues/issue-policy.test.ts` | Create | TDD tests for validation and state restrictions. |
| `apps/api/src/issues/issue-repository.ts` | Create | Repository interface and in-memory implementation. |
| `apps/api/src/issues/issue-repository.test.ts` | Create | TDD tests for create/update/list/detail/status log behavior. |
| `apps/api/src/issues/issue-service.ts` | Create | Application service orchestration for create/update/list/get/close. |
| `apps/api/src/issues/issue-service.test.ts` | Create | TDD tests for business behavior and error paths. |
| `apps/api/src/issues/issue-routes.ts` | Create | Express route registration for `/issues`. |
| `apps/api/src/issues/issue-routes.test.ts` | Create | TDD route tests using direct request/response harness, no port listening. |
| `apps/api/src/shared/errors.ts` | Create | `AppError`, stable error codes, HTTP status mapping. |
| `apps/api/src/app.ts` | Modify | Register issue routes. |

### Frontend files

| File | Action | Responsibility |
|---|---|---|
| `apps/web/src/api/issues.ts` | Create | Issue API client methods and response types. |
| `apps/web/src/issues/IssuePage.tsx` | Create | Issue module shell with list/new/detail states. |
| `apps/web/src/issues/IssuePage.test.tsx` | Create | Component-level smoke tests if test renderer is introduced; otherwise document as manual smoke in first pass. |
| `apps/web/src/main.tsx` | Modify | Add issue navigation state or route placeholder. |
| `tests/e2e/iteration-1-issue-smoke.spec.md` | Create | Manual/E2E smoke checklist until browser automation is installed. |

### Documentation / verification files

| File | Action | Responsibility |
|---|---|---|
| `development/iteration-1-issue-module-plan.md` | Create | This implementation plan and TDD checklist. |
| `scripts/verify-iteration1.mjs` | Create during execution | Verifies Iteration 1 routes, scripts, and test files exist. |
| `package.json` | Modify during execution | Add `test:iteration1` and `verify:iteration1`. |

---

## Target API Behavior

### Create Issue

Request shape:

```ts
{
  title: string;
  description: string;
  clueType?: 'demand_clue' | 'defect_clue' | 'unknown';
  priority?: 'P0' | 'P1' | 'P2' | 'P3';
  category?: string;
  sourceChannel?: string;
  impactScope?: string;
  expectedResult?: string;
  actualResult?: string;
  reproduceSteps?: string;
}
```

Expected result:

```ts
{
  id: string;
  issueNo: string;
  status: 'pending_triage';
}
```

Rules:

- `title` is required and must not be blank.
- `description` is required and must not be blank.
- Default `clueType = 'unknown'`.
- Default `priority = 'P2'`.
- Default `sourceChannel = 'manual'`.
- Default `status = 'pending_triage'`.
- Write one status log with `toStatus = 'pending_triage'`.
- Write one audit log with `action = 'issue.created'`.

### Update Issue

Rules:

- Only existing issue can be updated.
- `closed` issue cannot be updated.
- Update does not change status.
- Update does not create work item.
- Write audit log with `action = 'issue.updated'`.

### List Issues

Rules:

- Supports `keyword`, `status`, `clueType`, `priority`, `submitterId`, `createdFrom`, `createdTo`, `page`, `pageSize`.
- Default pagination: `page = 1`, `pageSize = 20`.
- Sort by newest `createdAt` first.
- Response shape includes `items` and `total`.

### Get Issue Detail

Rules:

- Returns base issue fields.
- Returns `statusLogs`.
- Returns `relatedWorkItems`, empty array for Iteration 1.
- Closed issue includes close fields.

### Close Issue

Rules:

- Only `pending_triage` issue can be closed in Iteration 1.
- `closeReasonType` or `closeReason` is required.
- Set `status = 'closed'`.
- Set `closedBy` and `closedAt`.
- Write status log from `pending_triage` to `closed`.
- Write audit log with `action = 'issue.closed'`.

---

## TDD Test Checklist

### Policy Tests: `apps/api/src/issues/issue-policy.test.ts`

- [ ] `validateCreateIssueInput rejects blank title`.
- [ ] `validateCreateIssueInput rejects blank description`.
- [ ] `validateCreateIssueInput accepts minimal title and description`.
- [ ] `assertIssueEditable rejects closed issue`.
- [ ] `assertIssueClosable rejects converted issue`.
- [ ] `validateCloseIssueInput rejects empty reason`.
- [ ] `validateCloseIssueInput accepts closeReasonType`.
- [ ] `validateCloseIssueInput accepts closeReason`.

### Repository Tests: `apps/api/src/issues/issue-repository.test.ts`

- [ ] `create stores issue with generated id and issue number`.
- [ ] `update changes editable fields without changing status`.
- [ ] `findById returns null for missing issue`.
- [ ] `list filters by status`.
- [ ] `list filters by clue type`.
- [ ] `list filters by priority`.
- [ ] `list filters by keyword in title and description`.
- [ ] `list paginates results`.
- [ ] `createStatusLog stores issue status log`.
- [ ] `createAuditLog stores issue audit log`.

### Service Tests: `apps/api/src/issues/issue-service.test.ts`

- [ ] `createIssue creates pending triage issue and writes status/audit logs`.
- [ ] `createIssue rejects blank title`.
- [ ] `createIssue rejects blank description`.
- [ ] `updateIssue updates pending issue and writes audit log`.
- [ ] `updateIssue rejects closed issue`.
- [ ] `listIssues returns filtered page`.
- [ ] `getIssue returns issue detail with status logs and empty related work items`.
- [ ] `closeIssue closes pending issue and writes status/audit logs`.
- [ ] `closeIssue rejects missing close reason`.
- [ ] `closeIssue rejects already closed issue`.
- [ ] `closeIssue rejects converted issue`.

### Route Tests: `apps/api/src/issues/issue-routes.test.ts`

- [ ] `POST /issues returns created issue envelope`.
- [ ] `POST /issues returns validation error for blank title`.
- [ ] `GET /issues returns paged issues envelope`.
- [ ] `GET /issues/:issueId returns detail envelope`.
- [ ] `PUT /issues/:issueId returns updated detail envelope`.
- [ ] `POST /issues/:issueId/close returns closed issue envelope`.
- [ ] `POST /issues/:issueId/close returns validation error for empty reason`.

### Frontend Client / Smoke Checklist

- [ ] `apps/web/src/api/issues.ts` exposes `createIssue`, `updateIssue`, `listIssues`, `getIssue`, `closeIssue`.
- [ ] `IssuePage` shows list state.
- [ ] `IssuePage` shows new issue action.
- [ ] `IssuePage` shows empty state when no issues exist.
- [ ] Manual smoke: create issue through API and confirm frontend issue module shell can show issue entry once connected.

---

## Implementation Tasks

### Task 1: Issue Policy and Error Model

**Files:**
- Create: `apps/api/src/shared/errors.ts`
- Create: `apps/api/src/issues/issue-types.ts`
- Create: `apps/api/src/issues/issue-policy.ts`
- Test: `apps/api/src/issues/issue-policy.test.ts`

- [ ] **Step 1: Write failing policy tests**

```ts
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { AppError } from '../shared/errors.js';
import {
  assertIssueClosable,
  assertIssueEditable,
  validateCloseIssueInput,
  validateCreateIssueInput,
} from './issue-policy.js';

test('validateCreateIssueInput rejects blank title', () => {
  assert.throws(
    () => validateCreateIssueInput({ title: '   ', description: '用户无法提交审批' }),
    (error) => error instanceof AppError && error.code === 'VALIDATION_ERROR',
  );
});

test('validateCreateIssueInput rejects blank description', () => {
  assert.throws(
    () => validateCreateIssueInput({ title: '审批失败', description: '   ' }),
    (error) => error instanceof AppError && error.code === 'VALIDATION_ERROR',
  );
});

test('validateCreateIssueInput accepts minimal title and description', () => {
  const input = validateCreateIssueInput({ title: '审批失败', description: '点击提交后报错' });

  assert.equal(input.title, '审批失败');
  assert.equal(input.description, '点击提交后报错');
  assert.equal(input.clueType, 'unknown');
  assert.equal(input.priority, 'P2');
});

test('assertIssueEditable rejects closed issue', () => {
  assert.throws(
    () => assertIssueEditable('closed'),
    (error) => error instanceof AppError && error.code === 'ISSUE_STATUS_INVALID',
  );
});

test('assertIssueClosable rejects converted issue', () => {
  assert.throws(
    () => assertIssueClosable('converted'),
    (error) => error instanceof AppError && error.code === 'ISSUE_STATUS_INVALID',
  );
});

test('validateCloseIssueInput rejects empty reason', () => {
  assert.throws(
    () => validateCloseIssueInput({ closeReasonType: ' ', closeReason: ' ' }),
    (error) => error instanceof AppError && error.code === 'VALIDATION_ERROR',
  );
});

test('validateCloseIssueInput accepts closeReasonType', () => {
  assert.equal(validateCloseIssueInput({ closeReasonType: 'duplicate' }).closeReasonType, 'duplicate');
});

test('validateCloseIssueInput accepts closeReason', () => {
  assert.equal(validateCloseIssueInput({ closeReason: '无需处理' }).closeReason, '无需处理');
});
```

- [ ] **Step 2: Run policy tests and verify RED**

Run:

```bash
npm run test -w apps/api -- --test-name-pattern "validateCreateIssueInput|assertIssue|validateCloseIssueInput"
```

Expected: FAIL because `apps/api/src/issues/issue-policy.ts` or exports do not exist.

- [ ] **Step 3: Implement minimal policy and error model**

```ts
// apps/api/src/shared/errors.ts
export type ErrorCode = 'VALIDATION_ERROR' | 'NOT_FOUND' | 'ISSUE_STATUS_INVALID' | 'INTERNAL_ERROR';

export class AppError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string,
    public readonly status = 400,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
  }
}
```

```ts
// apps/api/src/issues/issue-types.ts
import type { ClueType, IssueStatus, Priority } from '@ticketing/domain/src/domain-types';

export interface CreateIssueDto {
  title: string;
  description: string;
  clueType?: ClueType;
  priority?: Priority;
  category?: string;
  sourceChannel?: string;
  impactScope?: string;
  expectedResult?: string;
  actualResult?: string;
  reproduceSteps?: string;
}

export interface CloseIssueDto {
  closeReasonType?: string;
  closeReason?: string;
}

export interface NormalizedCreateIssueInput extends CreateIssueDto {
  clueType: ClueType;
  priority: Priority;
  sourceChannel: string;
}

export type EditableIssueStatus = IssueStatus;
```

```ts
// apps/api/src/issues/issue-policy.ts
import type { IssueStatus } from '@ticketing/domain/src/domain-types';
import { AppError } from '../shared/errors.js';
import type { CloseIssueDto, CreateIssueDto, NormalizedCreateIssueInput } from './issue-types.js';

function requiredText(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new AppError('VALIDATION_ERROR', `${field} is required`, 400, { field });
  }
  return value.trim();
}

export function validateCreateIssueInput(input: CreateIssueDto): NormalizedCreateIssueInput {
  return {
    ...input,
    title: requiredText(input.title, 'title'),
    description: requiredText(input.description, 'description'),
    clueType: input.clueType ?? 'unknown',
    priority: input.priority ?? 'P2',
    sourceChannel: input.sourceChannel ?? 'manual',
  };
}

export function assertIssueEditable(status: IssueStatus): void {
  if (status === 'closed') {
    throw new AppError('ISSUE_STATUS_INVALID', 'Closed issue cannot be edited', 409);
  }
}

export function assertIssueClosable(status: IssueStatus): void {
  if (status !== 'pending_triage') {
    throw new AppError('ISSUE_STATUS_INVALID', 'Only pending triage issue can be closed', 409);
  }
}

export function validateCloseIssueInput(input: CloseIssueDto): CloseIssueDto {
  const closeReasonType = input.closeReasonType?.trim();
  const closeReason = input.closeReason?.trim();
  if (!closeReasonType && !closeReason) {
    throw new AppError('VALIDATION_ERROR', 'close reason is required', 400);
  }
  return { closeReasonType, closeReason };
}
```

- [ ] **Step 4: Run policy tests and verify GREEN**

Run:

```bash
npm run test -w apps/api -- --test-name-pattern "validateCreateIssueInput|assertIssue|validateCloseIssueInput"
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/shared/errors.ts apps/api/src/issues/issue-types.ts apps/api/src/issues/issue-policy.ts apps/api/src/issues/issue-policy.test.ts
git commit -m "feat: add issue policy validation"
```

### Task 2: In-Memory Issue Repository

**Files:**
- Create: `apps/api/src/issues/issue-repository.ts`
- Test: `apps/api/src/issues/issue-repository.test.ts`

- [ ] **Step 1: Write failing repository tests**

```ts
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { InMemoryIssueRepository } from './issue-repository.js';

const userId = 'user_submitter';

test('create stores issue with generated id and issue number', async () => {
  const repo = new InMemoryIssueRepository();
  const issue = await repo.create({
    title: '审批失败',
    description: '点击提交后报错',
    clueType: 'defect_clue',
    status: 'pending_triage',
    priority: 'P1',
    sourceChannel: 'manual',
    submitterId: userId,
    createdBy: userId,
  });

  assert.match(issue.id, /^iss_/);
  assert.match(issue.issueNo, /^ISS-/);
  assert.equal(issue.status, 'pending_triage');
});

test('list filters by status, clue type, priority and keyword', async () => {
  const repo = new InMemoryIssueRepository();
  await repo.create({ title: '审批失败', description: '按钮报错', clueType: 'defect_clue', status: 'pending_triage', priority: 'P1', sourceChannel: 'manual', submitterId: userId, createdBy: userId });
  await repo.create({ title: '审批优化', description: '支持多级审批', clueType: 'demand_clue', status: 'closed', priority: 'P2', sourceChannel: 'manual', submitterId: userId, createdBy: userId });

  const result = await repo.list({ status: 'pending_triage', clueType: 'defect_clue', priority: 'P1', keyword: '按钮' });

  assert.equal(result.total, 1);
  assert.equal(result.items[0].title, '审批失败');
});

test('status and audit logs are stored per issue', async () => {
  const repo = new InMemoryIssueRepository();
  const issue = await repo.create({ title: '审批失败', description: '按钮报错', clueType: 'defect_clue', status: 'pending_triage', priority: 'P1', sourceChannel: 'manual', submitterId: userId, createdBy: userId });

  await repo.createStatusLog({ issueId: issue.id, fromStatus: null, toStatus: 'pending_triage', operatorId: userId, reason: 'created' });
  await repo.createAuditLog({ targetType: 'issue', targetId: issue.id, action: 'issue.created', operatorId: userId });

  assert.equal((await repo.listStatusLogs(issue.id)).length, 1);
  assert.equal((await repo.listAuditLogs(issue.id)).length, 1);
});
```

- [ ] **Step 2: Run repository tests and verify RED**

Run:

```bash
npm run test -w apps/api -- --test-name-pattern "InMemoryIssueRepository|create stores issue|list filters|status and audit"
```

Expected: FAIL because repository does not exist.

- [ ] **Step 3: Implement minimal repository**

Implement an in-memory repository with:

- `create(record)`.
- `update(issueId, patch)`.
- `findById(issueId)`.
- `list(filters)`.
- `createStatusLog(record)`.
- `listStatusLogs(issueId)`.
- `createAuditLog(record)`.
- `listAuditLogs(issueId)`.

Implementation constraints:

- Generate IDs as `iss_1`, `iss_2`.
- Generate issue numbers as `ISS-000001`, `ISS-000002`.
- Use ISO strings for `createdAt` and `updatedAt`.
- Default pagination: page 1, pageSize 20.

- [ ] **Step 4: Run repository tests and verify GREEN**

Run:

```bash
npm run test -w apps/api -- --test-name-pattern "InMemoryIssueRepository|create stores issue|list filters|status and audit"
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/issues/issue-repository.ts apps/api/src/issues/issue-repository.test.ts
git commit -m "feat: add in-memory issue repository"
```

### Task 3: Issue Service

**Files:**
- Create: `apps/api/src/issues/issue-service.ts`
- Test: `apps/api/src/issues/issue-service.test.ts`

- [ ] **Step 1: Write failing service tests**

Test the following behaviors with exact assertions:

```ts
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { AppError } from '../shared/errors.js';
import { InMemoryIssueRepository } from './issue-repository.js';
import { IssueApplicationService } from './issue-service.js';

const ctx = { userId: 'user_submitter', teamIds: ['team_a'], roles: ['submitter'], requestId: 'req_1' };

test('createIssue creates pending triage issue and writes status and audit logs', async () => {
  const repo = new InMemoryIssueRepository();
  const service = new IssueApplicationService(repo);

  const issue = await service.createIssue({ title: '审批失败', description: '按钮报错' }, ctx);
  const detail = await service.getIssue(issue.id, ctx);

  assert.equal(issue.status, 'pending_triage');
  assert.equal(detail.statusLogs.length, 1);
  assert.equal(detail.auditLogs.length, 1);
});

test('updateIssue rejects closed issue', async () => {
  const repo = new InMemoryIssueRepository();
  const service = new IssueApplicationService(repo);
  const issue = await service.createIssue({ title: '审批失败', description: '按钮报错' }, ctx);
  await service.closeIssue(issue.id, { closeReasonType: 'duplicate' }, ctx);

  await assert.rejects(
    () => service.updateIssue(issue.id, { title: '新标题' }, ctx),
    (error) => error instanceof AppError && error.code === 'ISSUE_STATUS_INVALID',
  );
});

test('closeIssue rejects missing close reason', async () => {
  const service = new IssueApplicationService(new InMemoryIssueRepository());
  const issue = await service.createIssue({ title: '审批失败', description: '按钮报错' }, ctx);

  await assert.rejects(
    () => service.closeIssue(issue.id, {}, ctx),
    (error) => error instanceof AppError && error.code === 'VALIDATION_ERROR',
  );
});
```

- [ ] **Step 2: Run service tests and verify RED**

Run:

```bash
npm run test -w apps/api -- --test-name-pattern "createIssue|updateIssue rejects closed|closeIssue rejects"
```

Expected: FAIL because `IssueApplicationService` does not exist.

- [ ] **Step 3: Implement minimal service**

Service methods:

- `createIssue(input, ctx)`.
- `updateIssue(issueId, input, ctx)`.
- `listIssues(query, ctx)`.
- `getIssue(issueId, ctx)`.
- `closeIssue(issueId, input, ctx)`.

Use policy functions from Task 1 and repository from Task 2. Throw `AppError('NOT_FOUND', ...)` when issue is missing.

- [ ] **Step 4: Run service tests and verify GREEN**

Run:

```bash
npm run test -w apps/api -- --test-name-pattern "createIssue|updateIssue rejects closed|closeIssue rejects"
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/issues/issue-service.ts apps/api/src/issues/issue-service.test.ts
git commit -m "feat: add issue application service"
```

### Task 4: Issue Routes

**Files:**
- Create: `apps/api/src/issues/issue-routes.ts`
- Create: `apps/api/src/issues/issue-routes.test.ts`
- Modify: `apps/api/src/app.ts`
- Modify: `apps/api/src/shared/api-response.ts`

- [ ] **Step 1: Write failing route tests**

Use a lightweight route harness without opening a port. Test route handlers by invoking Express app through `node:http` only if sandbox allows; if port listening is blocked, export pure route handler functions and test those directly.

Minimum tests:

- `createIssueHandler returns created issue envelope`.
- `createIssueHandler maps validation error to error envelope`.
- `listIssuesHandler returns paged issues envelope`.
- `getIssueHandler returns detail envelope`.
- `updateIssueHandler returns updated issue envelope`.
- `closeIssueHandler returns closed issue envelope`.

- [ ] **Step 2: Run route tests and verify RED**

Run:

```bash
npm run test -w apps/api -- --test-name-pattern "Issue route|createIssueHandler|closeIssueHandler"
```

Expected: FAIL because route handlers do not exist.

- [ ] **Step 3: Implement route handlers and route registration**

Routes:

- `POST /issues`.
- `GET /issues`.
- `GET /issues/:issueId`.
- `PUT /issues/:issueId`.
- `POST /issues/:issueId/close`.

Use shared response envelope:

```ts
{
  success: boolean;
  data: unknown | null;
  error: null | { code: string; message: string; details?: Record<string, unknown> };
  requestId: string;
}
```

- [ ] **Step 4: Run route tests and verify GREEN**

Run:

```bash
npm run test -w apps/api -- --test-name-pattern "Issue route|createIssueHandler|closeIssueHandler"
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/issues/issue-routes.ts apps/api/src/issues/issue-routes.test.ts apps/api/src/app.ts apps/api/src/shared/api-response.ts
git commit -m "feat: expose issue api routes"
```

### Task 5: Frontend Issue Shell and API Client

**Files:**
- Create: `apps/web/src/api/issues.ts`
- Create: `apps/web/src/issues/IssuePage.tsx`
- Modify: `apps/web/src/main.tsx`
- Create: `tests/e2e/iteration-1-issue-smoke.spec.md`

- [ ] **Step 1: Write failing frontend/client test or verifier**

If no React test tooling is installed yet, write `scripts/verify-iteration1.mjs` first and make it assert that:

- `apps/web/src/api/issues.ts` exists.
- `apps/web/src/issues/IssuePage.tsx` exists.
- `IssuePage.tsx` contains `新建问题单`.
- `IssuePage.tsx` contains `待分流问题池`.
- `tests/e2e/iteration-1-issue-smoke.spec.md` exists.

Run:

```bash
npm run verify:iteration1
```

Expected: FAIL before files exist.

- [ ] **Step 2: Implement API client and IssuePage shell**

Client exports:

- `createIssue(input)`.
- `updateIssue(issueId, input)`.
- `listIssues(query)`.
- `getIssue(issueId)`.
- `closeIssue(issueId, input)`.

Issue page shell shows:

- Title: `问题单`.
- Primary action: `新建问题单`.
- Tab/label: `待分流问题池`.
- Empty state.

- [ ] **Step 3: Run verifier and verify GREEN**

Run:

```bash
npm run verify:iteration1
npm run build -w apps/web
```

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/api/issues.ts apps/web/src/issues/IssuePage.tsx apps/web/src/main.tsx tests/e2e/iteration-1-issue-smoke.spec.md scripts/verify-iteration1.mjs package.json
git commit -m "feat: add issue frontend shell"
```

### Task 6: Iteration 1 Final Verification

**Files:**
- Modify: `README.md`
- Modify: `context/current-state.md`

- [ ] **Step 1: Run all checks**

```bash
npm run check
npm run build
npm run verify:iteration0
npm run verify:iteration1
```

Expected: all PASS.

- [ ] **Step 2: Run issue-focused tests**

```bash
npm run test -w apps/api -- --test-name-pattern "Issue|issue|createIssue|closeIssue|validateCreateIssueInput"
```

Expected: all PASS.

- [ ] **Step 3: Update docs**

Add Iteration 1 status to `context/current-state.md` and README commands:

```md
## Iteration 1 验证

- `npm run verify:iteration1`
- `npm run test -w apps/api -- --test-name-pattern "Issue|issue|createIssue|closeIssue"`
```

- [ ] **Step 4: Commit final docs**

```bash
git add README.md context/current-state.md
git commit -m "docs: update iteration 1 verification notes"
```

- [ ] **Step 5: Push**

```bash
git push origin main
```

---

## Acceptance Criteria Mapping

| Iteration 1 Acceptance | Evidence after execution |
|---|---|
| 可以手动创建问题单 | `IssueApplicationService.createIssue` tests + `POST /issues` route test |
| 可以编辑待分流问题单 | `updateIssue` service test + `PUT /issues/:issueId` route test |
| 已关闭问题单不可编辑 | `updateIssue rejects closed issue` test |
| 问题单列表筛选正确 | repository list filter tests + service list test |
| 问题单详情展示基础信息、状态日志和关闭信息 | `getIssue` service test |
| 关闭问题单必须填写关闭原因 | policy/service/route close validation tests |

---

## Execution Notes

- Do not introduce PostgreSQL repository in Iteration 1 unless in-memory vertical slice passes first.
- Do not implement triage endpoints even though OpenAPI already contains them.
- Do not add authentication beyond `RequestContext` test context.
- Do not commit generated `dist/` files.
- Commit after each task to preserve TDD checkpoints.
