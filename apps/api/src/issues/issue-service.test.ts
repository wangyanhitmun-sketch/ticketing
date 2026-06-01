import assert from 'node:assert/strict';
import { test } from 'node:test';
import { AppError } from '../shared/errors.js';
import { createAnonymousRequestContext } from '../shared/request-context.js';
import { InMemoryIssueRepository } from './issue-repository.js';
import { IssueApplicationService } from './issue-service.js';

function createService() {
  const repository = new InMemoryIssueRepository({
    now: () => '2026-06-01T00:00:00.000Z',
  });
  return {
    repository,
    service: new IssueApplicationService(repository),
    ctx: createAnonymousRequestContext('test-request'),
  };
}

test('createIssue creates pending triage issue and writes status/audit logs', () => {
  const { repository, service, ctx } = createService();

  const issue = service.createIssue({ title: '审批失败', description: '点击提交后报错' }, ctx);

  assert.equal(issue.status, 'pending_triage');
  assert.equal(issue.clueType, 'unknown');
  assert.equal(issue.priority, 'P2');
  assert.equal(repository.listStatusLogs(issue.id)[0]?.toStatus, 'pending_triage');
  assert.equal(repository.listAuditLogs(issue.id)[0]?.action, 'issue.created');
});

test('createIssue rejects blank title', () => {
  const { service, ctx } = createService();

  assert.throws(
    () => service.createIssue({ title: ' ', description: '点击提交后报错' }, ctx),
    (error: unknown) => error instanceof AppError && error.code === 'VALIDATION_ERROR',
  );
});

test('createIssue rejects blank description', () => {
  const { service, ctx } = createService();

  assert.throws(
    () => service.createIssue({ title: '审批失败', description: ' ' }, ctx),
    (error: unknown) => error instanceof AppError && error.code === 'VALIDATION_ERROR',
  );
});

test('updateIssue updates pending issue and writes audit log', () => {
  const { repository, service, ctx } = createService();
  const issue = service.createIssue({ title: '审批失败', description: '点击提交后报错' }, ctx);

  const updated = service.updateIssue(issue.id, { title: '审批偶现失败' }, ctx);

  assert.equal(updated.title, '审批偶现失败');
  assert.equal(updated.status, 'pending_triage');
  assert.equal(repository.listAuditLogs(issue.id).at(-1)?.action, 'issue.updated');
});

test('updateIssue rejects closed issue', () => {
  const { service, ctx } = createService();
  const issue = service.createIssue({ title: '审批失败', description: '点击提交后报错' }, ctx);
  service.closeIssue(issue.id, { closeReasonType: 'duplicate' }, ctx);

  assert.throws(
    () => service.updateIssue(issue.id, { title: '审批偶现失败' }, ctx),
    (error: unknown) => error instanceof AppError && error.code === 'ISSUE_STATUS_INVALID',
  );
});

test('listIssues returns filtered page', () => {
  const { service, ctx } = createService();
  service.createIssue({ title: '审批失败', description: '点击提交后报错', clueType: 'defect_clue' }, ctx);
  service.createIssue({ title: '导出优化', description: '希望支持批量导出', clueType: 'demand_clue' }, ctx);

  const result = service.listIssues({ clueType: 'demand_clue', page: 1, pageSize: 10 });

  assert.equal(result.total, 1);
  assert.equal(result.items[0]?.title, '导出优化');
});

test('getIssue returns issue detail with status logs and empty related work items', () => {
  const { service, ctx } = createService();
  const issue = service.createIssue({ title: '审批失败', description: '点击提交后报错' }, ctx);

  const detail = service.getIssue(issue.id);

  assert.equal(detail.id, issue.id);
  assert.equal(detail.statusLogs.length, 1);
  assert.deepEqual(detail.relatedWorkItems, []);
});

test('closeIssue closes pending issue and writes status/audit logs', () => {
  const { repository, service, ctx } = createService();
  const issue = service.createIssue({ title: '审批失败', description: '点击提交后报错' }, ctx);

  const closed = service.closeIssue(issue.id, { closeReason: '重复反馈' }, ctx);

  assert.equal(closed.status, 'closed');
  assert.equal(closed.closeReason, '重复反馈');
  assert.equal(repository.listStatusLogs(issue.id).at(-1)?.toStatus, 'closed');
  assert.equal(repository.listAuditLogs(issue.id).at(-1)?.action, 'issue.closed');
});

test('closeIssue rejects missing close reason', () => {
  const { service, ctx } = createService();
  const issue = service.createIssue({ title: '审批失败', description: '点击提交后报错' }, ctx);

  assert.throws(
    () => service.closeIssue(issue.id, {}, ctx),
    (error: unknown) => error instanceof AppError && error.code === 'VALIDATION_ERROR',
  );
});

test('closeIssue rejects already closed issue', () => {
  const { service, ctx } = createService();
  const issue = service.createIssue({ title: '审批失败', description: '点击提交后报错' }, ctx);
  service.closeIssue(issue.id, { closeReasonType: 'duplicate' }, ctx);

  assert.throws(
    () => service.closeIssue(issue.id, { closeReasonType: 'duplicate' }, ctx),
    (error: unknown) => error instanceof AppError && error.code === 'ISSUE_STATUS_INVALID',
  );
});

test('closeIssue rejects converted issue', () => {
  const { repository, service, ctx } = createService();
  const issue = service.createIssue({ title: '审批失败', description: '点击提交后报错' }, ctx);
  repository.updateStatusForTest(issue.id, 'converted');

  assert.throws(
    () => service.closeIssue(issue.id, { closeReasonType: 'duplicate' }, ctx),
    (error: unknown) => error instanceof AppError && error.code === 'ISSUE_STATUS_INVALID',
  );
});
