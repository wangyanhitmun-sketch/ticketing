import assert from 'node:assert/strict';
import { test } from 'node:test';
import { AppError } from '../shared/errors.js';
import {
  assertNoImmutableWorkItemFields,
  getInitialWorkItemStatus,
  validateCreateWorkItemInput,
} from './work-item-policy.js';

test('validateCreateWorkItemInput rejects blank title', () => {
  assert.throws(
    () => validateCreateWorkItemInput({ type: 'business_requirement', title: ' ', description: '审批链路优化' }),
    (error: unknown) => error instanceof AppError && error.code === 'VALIDATION_ERROR',
  );
});

test('validateCreateWorkItemInput rejects blank description', () => {
  assert.throws(
    () => validateCreateWorkItemInput({ type: 'business_requirement', title: '审批优化', description: ' ' }),
    (error: unknown) => error instanceof AppError && error.code === 'VALIDATION_ERROR',
  );
});

test('validateCreateWorkItemInput rejects invalid type', () => {
  assert.throws(
    () => validateCreateWorkItemInput({ type: 'requirement', title: '审批优化', description: '审批链路优化' } as never),
    (error: unknown) => error instanceof AppError && error.code === 'VALIDATION_ERROR',
  );
});

test('validateCreateWorkItemInput accepts business requirement', () => {
  const input = validateCreateWorkItemInput({ type: 'business_requirement', title: '审批优化', description: '审批链路优化' });

  assert.equal(input.type, 'business_requirement');
  assert.equal(input.priority, 'P2');
  assert.equal(input.sourceType, 'manual');
});

test('validateCreateWorkItemInput accepts technical requirement', () => {
  assert.equal(
    validateCreateWorkItemInput({ type: 'technical_requirement', title: '缓存改造', description: '提升查询性能' }).type,
    'technical_requirement',
  );
});

test('validateCreateWorkItemInput accepts defect', () => {
  assert.equal(
    validateCreateWorkItemInput({ type: 'defect', title: '审批失败', description: '提交时报错' }).type,
    'defect',
  );
});

test('getInitialWorkItemStatus returns unassigned without assignee or team', () => {
  assert.equal(getInitialWorkItemStatus({}), 'unassigned');
});

test('getInitialWorkItemStatus returns ready_for_dev with assignee', () => {
  assert.equal(getInitialWorkItemStatus({ assigneeId: 'user-1' }), 'ready_for_dev');
});

test('getInitialWorkItemStatus returns ready_for_dev with team', () => {
  assert.equal(getInitialWorkItemStatus({ teamId: 'team-1' }), 'ready_for_dev');
});

test('getInitialWorkItemStatus ignores owner only', () => {
  assert.equal(getInitialWorkItemStatus({ ownerId: 'user-owner' }), 'unassigned');
});

test('assertNoImmutableWorkItemFields rejects type changes', () => {
  assert.throws(
    () => assertNoImmutableWorkItemFields({ type: 'defect' } as never),
    (error: unknown) => error instanceof AppError && error.code === 'VALIDATION_ERROR',
  );
});

test('assertNoImmutableWorkItemFields rejects status changes', () => {
  assert.throws(
    () => assertNoImmutableWorkItemFields({ status: 'completed' } as never),
    (error: unknown) => error instanceof AppError && error.code === 'VALIDATION_ERROR',
  );
});
