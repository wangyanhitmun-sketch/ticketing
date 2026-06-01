import assert from 'node:assert/strict';
import { test } from 'node:test';
import { InMemoryWorkItemRepository } from './work-item-repository.js';

function createRepository() {
  return new InMemoryWorkItemRepository({
    now: () => '2026-06-01T00:00:00.000Z',
  });
}

function createWorkItem(repo = createRepository(), overrides: Partial<Parameters<typeof repo.create>[0]> = {}) {
  return repo.create({
    type: 'business_requirement',
    title: '审批优化',
    description: '优化审批链路',
    sourceType: 'manual',
    status: 'unassigned',
    progress: 0,
    priority: 'P1',
    level: 1,
    isLeaf: true,
    createdBy: 'user-1',
    ...overrides,
  });
}

test('create stores work item with generated id and number', () => {
  const repo = createRepository();

  const workItem = createWorkItem(repo);

  assert.equal(workItem.id, 'work-item-1');
  assert.equal(workItem.workItemNo, 'WI-000001');
  assert.equal(repo.findById(workItem.id)?.title, '审批优化');
});

test('create stores manual source defaults', () => {
  const workItem = createWorkItem();

  assert.equal(workItem.sourceType, 'manual');
  assert.equal(workItem.level, 1);
  assert.equal(workItem.isLeaf, true);
  assert.equal(workItem.parentId, null);
  assert.equal(workItem.progress, 0);
});

test('update changes editable fields without changing status or progress', () => {
  const repo = createRepository();
  const workItem = createWorkItem(repo, { status: 'ready_for_dev', progress: 0 });

  const updated = repo.update(workItem.id, { title: '审批体验优化', priority: 'P2', progress: 80 } as never);

  assert.equal(updated?.title, '审批体验优化');
  assert.equal(updated?.priority, 'P2');
  assert.equal(updated?.status, 'ready_for_dev');
  assert.equal(updated?.progress, 0);
});

test('findById returns null for missing work item', () => {
  assert.equal(createRepository().findById('missing'), null);
});

test('list filters by type', () => {
  const repo = createRepository();
  createWorkItem(repo, { title: '业务需求', type: 'business_requirement' });
  createWorkItem(repo, { title: '缺陷', type: 'defect' });

  const result = repo.list({ type: 'defect' });

  assert.equal(result.total, 1);
  assert.equal(result.items[0]?.title, '缺陷');
});

test('list filters by status', () => {
  const repo = createRepository();
  createWorkItem(repo, { title: '待分配', status: 'unassigned' });
  createWorkItem(repo, { title: '待开发', status: 'ready_for_dev' });

  const result = repo.list({ status: 'ready_for_dev' });

  assert.equal(result.total, 1);
  assert.equal(result.items[0]?.title, '待开发');
});

test('list filters by source type', () => {
  const repo = createRepository();
  createWorkItem(repo, { title: '手动创建', sourceType: 'manual' });
  createWorkItem(repo, { title: '问题单转入', sourceType: 'issue_converted' });

  const result = repo.list({ sourceType: 'issue_converted' });

  assert.equal(result.total, 1);
  assert.equal(result.items[0]?.title, '问题单转入');
});

test('list filters by assignee and team', () => {
  const repo = createRepository();
  createWorkItem(repo, { title: 'A 团队任务', assigneeId: 'user-1', teamId: 'team-a' });
  createWorkItem(repo, { title: 'B 团队任务', assigneeId: 'user-2', teamId: 'team-b' });

  const result = repo.list({ assigneeId: 'user-2', teamId: 'team-b' });

  assert.equal(result.total, 1);
  assert.equal(result.items[0]?.title, 'B 团队任务');
});

test('list filters by keyword in title and description', () => {
  const repo = createRepository();
  createWorkItem(repo, { title: '审批优化', description: '提升审批速度' });
  createWorkItem(repo, { title: '导出改造', description: '审批数据可以批量导出' });

  const result = repo.list({ keyword: '批量导出' });

  assert.equal(result.total, 1);
  assert.equal(result.items[0]?.title, '导出改造');
});

test('list paginates results', () => {
  const repo = createRepository();
  createWorkItem(repo, { title: '第一个' });
  createWorkItem(repo, { title: '第二个' });
  createWorkItem(repo, { title: '第三个' });

  const result = repo.list({ page: 2, pageSize: 1 });

  assert.equal(result.total, 3);
  assert.equal(result.items[0]?.title, '第二个');
});

test('createStatusLog stores work item status log', () => {
  const repo = createRepository();
  const workItem = createWorkItem(repo);

  repo.createStatusLog({
    workItemId: workItem.id,
    fromStatus: null,
    toStatus: 'unassigned',
    operatorId: 'user-1',
    reason: null,
  });

  assert.equal(repo.listStatusLogs(workItem.id).length, 1);
  assert.equal(repo.listStatusLogs(workItem.id)[0]?.toStatus, 'unassigned');
});

test('createAuditLog stores work item audit log', () => {
  const repo = createRepository();
  const workItem = createWorkItem(repo);

  repo.createAuditLog({
    targetType: 'work_item',
    targetId: workItem.id,
    action: 'work_item.created',
    operatorId: 'user-1',
    detail: { title: workItem.title },
  });

  assert.equal(repo.listAuditLogs(workItem.id).length, 1);
  assert.equal(repo.listAuditLogs(workItem.id)[0]?.action, 'work_item.created');
});
