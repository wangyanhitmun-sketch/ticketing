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
    (error: unknown) => error instanceof AppError && error.code === 'VALIDATION_ERROR',
  );
});

test('validateCreateIssueInput rejects blank description', () => {
  assert.throws(
    () => validateCreateIssueInput({ title: '审批失败', description: '   ' }),
    (error: unknown) => error instanceof AppError && error.code === 'VALIDATION_ERROR',
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
    (error: unknown) => error instanceof AppError && error.code === 'ISSUE_STATUS_INVALID',
  );
});

test('assertIssueClosable rejects converted issue', () => {
  assert.throws(
    () => assertIssueClosable('converted'),
    (error: unknown) => error instanceof AppError && error.code === 'ISSUE_STATUS_INVALID',
  );
});

test('validateCloseIssueInput rejects empty reason', () => {
  assert.throws(
    () => validateCloseIssueInput({ closeReasonType: ' ', closeReason: ' ' }),
    (error: unknown) => error instanceof AppError && error.code === 'VALIDATION_ERROR',
  );
});

test('validateCloseIssueInput accepts closeReasonType', () => {
  assert.equal(validateCloseIssueInput({ closeReasonType: 'duplicate' }).closeReasonType, 'duplicate');
});

test('validateCloseIssueInput accepts closeReason', () => {
  assert.equal(validateCloseIssueInput({ closeReason: '无需处理' }).closeReason, '无需处理');
});
