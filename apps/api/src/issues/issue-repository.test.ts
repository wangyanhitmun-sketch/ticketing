import assert from 'node:assert/strict';
import { test } from 'node:test';
import { InMemoryIssueRepository } from './issue-repository.js';

function createRepository() {
  return new InMemoryIssueRepository({
    now: () => '2026-06-01T00:00:00.000Z',
  });
}

function createIssue(repo = createRepository(), overrides: Partial<Parameters<typeof repo.create>[0]> = {}) {
  return repo.create({
    title: '审批失败',
    description: '点击提交后报错',
    clueType: 'defect_clue',
    status: 'pending_triage',
    priority: 'P1',
    sourceChannel: 'manual',
    submitterId: 'user-1',
    createdBy: 'user-1',
    ...overrides,
  });
}

test('create stores issue with generated id and issue number', () => {
  const repo = createRepository();

  const issue = createIssue(repo);

  assert.equal(issue.id, 'issue-1');
  assert.equal(issue.issueNo, 'ISSUE-000001');
  assert.equal(repo.findById(issue.id)?.title, '审批失败');
});

test('update changes editable fields without changing status', () => {
  const repo = createRepository();
  const issue = createIssue(repo);

  const updated = repo.update(issue.id, { title: '审批偶现失败', priority: 'P2' });

  assert.equal(updated?.title, '审批偶现失败');
  assert.equal(updated?.priority, 'P2');
  assert.equal(updated?.status, 'pending_triage');
});

test('findById returns null for missing issue', () => {
  assert.equal(createRepository().findById('missing'), null);
});

test('list filters by status', () => {
  const repo = createRepository();
  createIssue(repo, { title: '待分流问题', status: 'pending_triage' });
  createIssue(repo, { title: '已关闭问题', status: 'closed' });

  const result = repo.list({ status: 'closed' });

  assert.equal(result.total, 1);
  assert.equal(result.items[0]?.title, '已关闭问题');
});

test('list filters by clue type', () => {
  const repo = createRepository();
  createIssue(repo, { title: '需求线索', clueType: 'demand_clue' });
  createIssue(repo, { title: '缺陷线索', clueType: 'defect_clue' });

  const result = repo.list({ clueType: 'demand_clue' });

  assert.equal(result.total, 1);
  assert.equal(result.items[0]?.title, '需求线索');
});

test('list filters by priority', () => {
  const repo = createRepository();
  createIssue(repo, { title: '高优先级', priority: 'P1' });
  createIssue(repo, { title: '低优先级', priority: 'P3' });

  const result = repo.list({ priority: 'P3' });

  assert.equal(result.total, 1);
  assert.equal(result.items[0]?.title, '低优先级');
});

test('list filters by keyword in title and description', () => {
  const repo = createRepository();
  createIssue(repo, { title: '审批失败', description: '无关内容' });
  createIssue(repo, { title: '通知异常', description: '审批消息没有发送' });

  const result = repo.list({ keyword: '审批消息' });

  assert.equal(result.total, 1);
  assert.equal(result.items[0]?.title, '通知异常');
});

test('list paginates results', () => {
  const repo = createRepository();
  createIssue(repo, { title: '第一个' });
  createIssue(repo, { title: '第二个' });
  createIssue(repo, { title: '第三个' });

  const result = repo.list({ page: 2, pageSize: 1 });

  assert.equal(result.total, 3);
  assert.equal(result.items.length, 1);
  assert.equal(result.items[0]?.title, '第二个');
});

test('createStatusLog stores issue status log', () => {
  const repo = createRepository();
  const issue = createIssue(repo);

  repo.createStatusLog({
    targetId: issue.id,
    fromStatus: null,
    toStatus: 'pending_triage',
    operatorId: 'user-1',
    reason: null,
  });

  assert.equal(repo.listStatusLogs(issue.id).length, 1);
  assert.equal(repo.listStatusLogs(issue.id)[0]?.toStatus, 'pending_triage');
});

test('createAuditLog stores issue audit log', () => {
  const repo = createRepository();
  const issue = createIssue(repo);

  repo.createAuditLog({
    targetType: 'issue',
    targetId: issue.id,
    action: 'issue.created',
    operatorId: 'user-1',
    detail: { title: issue.title },
  });

  assert.equal(repo.listAuditLogs(issue.id).length, 1);
  assert.equal(repo.listAuditLogs(issue.id)[0]?.action, 'issue.created');
});
