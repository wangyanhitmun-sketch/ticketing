import assert from 'node:assert/strict';
import { test } from 'node:test';
import { AppError } from '../shared/errors.js';
import { createAnonymousRequestContext } from '../shared/request-context.js';
import { InMemoryWorkItemRepository } from './work-item-repository.js';
import { WorkItemApplicationService } from './work-item-service.js';

function createService() {
  const repository = new InMemoryWorkItemRepository({ now: () => '2026-06-01T00:00:00.000Z' });
  return {
    repository,
    service: new WorkItemApplicationService(repository),
    ctx: createAnonymousRequestContext('test-request'),
  };
}

test('createWorkItem creates business requirement with manual source and status log', () => {
  const { repository, service, ctx } = createService();

  const workItem = service.createWorkItem({ type: 'business_requirement', title: '审批优化', description: '优化审批链路' }, ctx);

  assert.equal(workItem.type, 'business_requirement');
  assert.equal(workItem.sourceType, 'manual');
  assert.equal(workItem.status, 'unassigned');
  assert.equal(repository.listStatusLogs(workItem.id)[0]?.toStatus, 'unassigned');
  assert.equal(repository.listAuditLogs(workItem.id)[0]?.action, 'work_item.created');
});

test('createWorkItem creates technical requirement', () => {
  const { service, ctx } = createService();

  const workItem = service.createWorkItem({ type: 'technical_requirement', title: '缓存改造', description: '提升查询性能' }, ctx);

  assert.equal(workItem.type, 'technical_requirement');
});

test('createWorkItem creates defect', () => {
  const { service, ctx } = createService();

  const workItem = service.createWorkItem({ type: 'defect', title: '审批失败', description: '提交时报错' }, ctx);

  assert.equal(workItem.type, 'defect');
});

test('createWorkItem sets ready_for_dev when assignee exists', () => {
  const { service, ctx } = createService();

  const workItem = service.createWorkItem({ type: 'defect', title: '审批失败', description: '提交时报错', assigneeId: 'user-1' }, ctx);

  assert.equal(workItem.status, 'ready_for_dev');
});

test('createWorkItem keeps unassigned when only owner exists', () => {
  const { service, ctx } = createService();

  const workItem = service.createWorkItem({ type: 'business_requirement', title: '审批优化', description: '优化审批链路', ownerId: 'owner-1' }, ctx);

  assert.equal(workItem.status, 'unassigned');
});

test('createWorkItem rejects blank title', () => {
  const { service, ctx } = createService();

  assert.throws(
    () => service.createWorkItem({ type: 'defect', title: ' ', description: '提交时报错' }, ctx),
    (error: unknown) => error instanceof AppError && error.code === 'VALIDATION_ERROR',
  );
});

test('updateWorkItem updates editable fields and writes audit log', () => {
  const { repository, service, ctx } = createService();
  const workItem = service.createWorkItem({ type: 'business_requirement', title: '审批优化', description: '优化审批链路' }, ctx);

  const updated = service.updateWorkItem(workItem.id, { title: '审批体验优化', priority: 'P2' }, ctx);

  assert.equal(updated.title, '审批体验优化');
  assert.equal(updated.status, 'unassigned');
  assert.equal(repository.listAuditLogs(workItem.id).at(-1)?.action, 'work_item.updated');
});

test('updateWorkItem rejects immutable type change', () => {
  const { service, ctx } = createService();
  const workItem = service.createWorkItem({ type: 'business_requirement', title: '审批优化', description: '优化审批链路' }, ctx);

  assert.throws(
    () => service.updateWorkItem(workItem.id, { type: 'defect' } as never, ctx),
    (error: unknown) => error instanceof AppError && error.code === 'VALIDATION_ERROR',
  );
});

test('listWorkItems returns filtered page', () => {
  const { service, ctx } = createService();
  service.createWorkItem({ type: 'business_requirement', title: '审批优化', description: '优化审批链路' }, ctx);
  service.createWorkItem({ type: 'defect', title: '审批失败', description: '提交时报错' }, ctx);

  const result = service.listWorkItems({ type: 'defect', page: 1, pageSize: 10 });

  assert.equal(result.total, 1);
  assert.equal(result.items[0]?.title, '审批失败');
});

test('getWorkItem returns detail with status logs and empty source/progress/children', () => {
  const { service, ctx } = createService();
  const workItem = service.createWorkItem({ type: 'technical_requirement', title: '缓存改造', description: '提升查询性能' }, ctx);

  const detail = service.getWorkItem(workItem.id);

  assert.equal(detail.id, workItem.id);
  assert.equal(detail.statusLogs.length, 1);
  assert.deepEqual(detail.progressLogs, []);
  assert.deepEqual(detail.sourceIssues, []);
  assert.deepEqual(detail.children, []);
  assert.equal(detail.parent, null);
});
