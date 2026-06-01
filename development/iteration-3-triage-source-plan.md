# Iteration 3 Triage and Source Traceability Implementation Plan

> **Goal:** Build the P0 triage minimum closed loop: convert a pending issue to business requirement, technical requirement, or defect work item; persist the issue-work item source relationship; expose traceability in issue and work item detail.
>
> **Required method:** TDD. For every behavior: RED -> GREEN -> REFACTOR. No production code without a failing test first.

## Scope

### In Scope

- Triage APIs:
  - `POST /issues/{issueId}/triage/business-requirement`
  - `POST /issues/{issueId}/triage/technical-requirement`
  - `POST /issues/{issueId}/triage/defect`
- Source relationship repository for `issue_work_item_source` behavior.
- Triage service orchestration:
  - validate issue exists and is `pending_triage`.
  - create target work item with `sourceType = issue_converted`.
  - create issue-work item source relation with `relationType = converted`.
  - update issue status to `converted`.
  - write issue status log, work item status log, and audit logs.
- Draft inheritance defaults:
  - title and description default from issue when omitted.
  - priority and impact scope default from issue when omitted.
  - defect also defaults expected/actual/reproduce fields from issue when omitted.
- Traceability in detail views:
  - issue detail returns related work items.
  - work item detail returns source issues.
- Contract, frontend client/shell affordance, verification script, smoke checklist, status docs.

### Out of Scope

- Idempotency-key persistence; keep planned for later hardening.
- Rollback simulation for in-memory failure injection beyond unit behavior.
- Triage to existing work item / association without creation; P1.
- PostgreSQL repository implementation.
- Permission enforcement and real authentication.

## TDD Checklist

### Source Repository Tests

- [ ] `create stores issue work item source relation`.
- [ ] `create rejects duplicate issue and work item relation`.
- [ ] `listByIssueId returns issue relations`.
- [ ] `listByWorkItemId returns work item relations`.

### Triage Service Tests

- [ ] `triageToBusinessRequirement creates converted work item and source relation`.
- [ ] `triageToTechnicalRequirement creates technical requirement`.
- [ ] `triageToDefect creates defect with defect fields inherited from issue`.
- [ ] `triage inherits title description priority and impact scope from issue`.
- [ ] `triage sets ready_for_dev when assignee exists`.
- [ ] `triage rejects non pending issue`.
- [ ] `triage rejects missing issue`.
- [ ] `issue detail returns related work items after triage`.
- [ ] `work item detail returns source issues after triage`.

### Route Tests

- [ ] `POST /issues/:issueId/triage/business-requirement returns triage result envelope`.
- [ ] `POST /issues/:issueId/triage/technical-requirement returns triage result envelope`.
- [ ] `POST /issues/:issueId/triage/defect returns triage result envelope`.
- [ ] `POST triage returns status error for already converted issue`.
- [ ] `GET /issues/:issueId shows related work item after triage`.
- [ ] `GET /work-items/:workItemId shows source issue after triage`.

## Implementation Tasks

1. **Task 0:** Commit this plan.
2. **Task 1:** Source relation repository and tests.
3. **Task 2:** Shared route dependencies and detail traceability.
4. **Task 3:** Triage service and tests.
5. **Task 4:** Triage routes and route tests.
6. **Task 5:** Contracts, frontend, verifier, smoke checklist and docs.

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
npm run test:iteration3
npm run verify:iteration3
```
