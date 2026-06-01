import assert from 'node:assert/strict';
import { test } from 'node:test';
import { AppError } from '../shared/errors.js';
import { InMemoryIssueWorkItemSourceRepository } from './source-repository.js';

function createRepository() {
  return new InMemoryIssueWorkItemSourceRepository({ now: () => '2026-06-01T00:00:00.000Z' });
}

test('create stores issue work item source relation', () => {
  const repo = createRepository();

  const relation = repo.create({ issueId: 'issue-1', workItemId: 'work-item-1', relationType: 'converted', createdBy: 'user-1' });

  assert.equal(relation.id, 'issue-work-item-source-1');
  assert.equal(relation.issueId, 'issue-1');
  assert.equal(relation.workItemId, 'work-item-1');
});

test('create rejects duplicate issue and work item relation', () => {
  const repo = createRepository();
  repo.create({ issueId: 'issue-1', workItemId: 'work-item-1', relationType: 'converted', createdBy: 'user-1' });

  assert.throws(
    () => repo.create({ issueId: 'issue-1', workItemId: 'work-item-1', relationType: 'converted', createdBy: 'user-1' }),
    (error: unknown) => error instanceof AppError && error.code === 'SOURCE_RELATION_FAILED',
  );
});

test('listByIssueId returns issue relations', () => {
  const repo = createRepository();
  repo.create({ issueId: 'issue-1', workItemId: 'work-item-1', relationType: 'converted', createdBy: 'user-1' });
  repo.create({ issueId: 'issue-2', workItemId: 'work-item-2', relationType: 'converted', createdBy: 'user-1' });

  const result = repo.listByIssueId('issue-1');

  assert.equal(result.length, 1);
  assert.equal(result[0]?.workItemId, 'work-item-1');
});

test('listByWorkItemId returns work item relations', () => {
  const repo = createRepository();
  repo.create({ issueId: 'issue-1', workItemId: 'work-item-1', relationType: 'converted', createdBy: 'user-1' });
  repo.create({ issueId: 'issue-2', workItemId: 'work-item-2', relationType: 'converted', createdBy: 'user-1' });

  const result = repo.listByWorkItemId('work-item-2');

  assert.equal(result.length, 1);
  assert.equal(result[0]?.issueId, 'issue-2');
});
