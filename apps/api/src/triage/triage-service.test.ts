import assert from 'node:assert/strict';
import { test } from 'node:test';
import { AppError } from '../shared/errors.js';
import { createAnonymousRequestContext } from '../shared/request-context.js';
import { IssueApplicationService } from '../issues/issue-service.js';
import { InMemoryIssueRepository } from '../issues/issue-repository.js';
import { InMemoryIssueWorkItemSourceRepository } from '../sources/source-repository.js';
import { WorkItemApplicationService } from '../work-items/work-item-service.js';
import { InMemoryWorkItemRepository } from '../work-items/work-item-repository.js';
import { TriageApplicationService } from './triage-service.js';

function createServices() {
  const issueRepository = new InMemoryIssueRepository({ now: () => '2026-06-01T00:00:00.000Z' });
  const workItemRepository = new InMemoryWorkItemRepository({ now: () => '2026-06-01T00:00:00.000Z' });
  const sourceRepository = new InMemoryIssueWorkItemSourceRepository({ now: () => '2026-06-01T00:00:00.000Z' });
  const issueService = new IssueApplicationService(issueRepository, { sourceRepository, workItemRepository });
  const workItemService = new WorkItemApplicationService(workItemRepository, { sourceRepository, issueRepository });
  const triageService = new TriageApplicationService(issueRepository, workItemRepository, sourceRepository);
  const ctx = createAnonymousRequestContext('test-request');
  return { issueRepository, workItemRepository, sourceRepository, issueService, workItemService, triageService, ctx };
}

test('triageToBusinessRequirement creates converted work item and source relation', () => {
  const { issueRepository, sourceRepository, issueService, triageService, ctx } = createServices();
  const issue = issueService.createIssue({ title: '审批优化', description: '优化审批链路', clueType: 'demand_clue' }, ctx);

  const result = triageService.triageToBusinessRequirement(issue.id, {}, ctx);

  assert.equal(result.issueStatus, 'converted');
  assert.equal(result.workItem.type, 'business_requirement');
  assert.equal(result.workItem.sourceType, 'issue_converted');
  assert.equal(issueRepository.findById(issue.id)?.status, 'converted');
  assert.equal(sourceRepository.listByIssueId(issue.id)[0]?.workItemId, result.workItem.id);
});

test('triageToTechnicalRequirement creates technical requirement', () => {
  const { issueService, triageService, ctx } = createServices();
  const issue = issueService.createIssue({ title: '缓存改造', description: '提升查询性能' }, ctx);

  const result = triageService.triageToTechnicalRequirement(issue.id, {}, ctx);

  assert.equal(result.workItem.type, 'technical_requirement');
  assert.equal(result.workItem.sourceType, 'issue_converted');
});

test('triageToDefect creates defect with defect fields inherited from issue', () => {
  const { issueService, triageService, ctx } = createServices();
  const issue = issueService.createIssue({
    title: '审批失败',
    description: '提交时报错',
    clueType: 'defect_clue',
    expectedResult: '提交成功',
    actualResult: '页面报错',
    reproduceSteps: '打开审批页并提交',
  }, ctx);

  const result = triageService.triageToDefect(issue.id, {}, ctx);

  assert.equal(result.workItem.type, 'defect');
  assert.equal(result.workItem.expectedResult, '提交成功');
  assert.equal(result.workItem.actualResult, '页面报错');
  assert.equal(result.workItem.reproduceSteps, '打开审批页并提交');
});

test('triage inherits title description priority and impact scope from issue', () => {
  const { issueService, triageService, ctx } = createServices();
  const issue = issueService.createIssue({ title: '审批优化', description: '优化审批链路', priority: 'P1', impactScope: '审批模块' }, ctx);

  const result = triageService.triageToBusinessRequirement(issue.id, {}, ctx);

  assert.equal(result.workItem.title, '审批优化');
  assert.equal(result.workItem.description, '优化审批链路');
  assert.equal(result.workItem.priority, 'P1');
  assert.equal(result.workItem.impactScope, '审批模块');
});

test('triage sets ready_for_dev when assignee exists', () => {
  const { issueService, triageService, ctx } = createServices();
  const issue = issueService.createIssue({ title: '审批失败', description: '提交时报错' }, ctx);

  const result = triageService.triageToDefect(issue.id, { assigneeId: 'user-1' }, ctx);

  assert.equal(result.workItem.status, 'ready_for_dev');
});

test('triage rejects non pending issue', () => {
  const { issueService, triageService, ctx } = createServices();
  const issue = issueService.createIssue({ title: '审批失败', description: '提交时报错' }, ctx);
  issueService.closeIssue(issue.id, { closeReason: '无需处理' }, ctx);

  assert.throws(
    () => triageService.triageToDefect(issue.id, {}, ctx),
    (error: unknown) => error instanceof AppError && error.code === 'ISSUE_STATUS_INVALID',
  );
});

test('triage rejects missing issue', () => {
  const { triageService, ctx } = createServices();

  assert.throws(
    () => triageService.triageToDefect('missing', {}, ctx),
    (error: unknown) => error instanceof AppError && error.code === 'NOT_FOUND',
  );
});

test('issue detail returns related work items after triage', () => {
  const { issueService, triageService, ctx } = createServices();
  const issue = issueService.createIssue({ title: '审批优化', description: '优化审批链路' }, ctx);
  const result = triageService.triageToBusinessRequirement(issue.id, {}, ctx);

  const detail = issueService.getIssue(issue.id);

  assert.equal(detail.relatedWorkItems.length, 1);
  assert.equal(detail.relatedWorkItems[0]?.id, result.workItem.id);
});

test('work item detail returns source issues after triage', () => {
  const { issueService, workItemService, triageService, ctx } = createServices();
  const issue = issueService.createIssue({ title: '审批优化', description: '优化审批链路' }, ctx);
  const result = triageService.triageToBusinessRequirement(issue.id, {}, ctx);

  const detail = workItemService.getWorkItem(result.workItem.id);

  assert.equal(detail.sourceIssues.length, 1);
  assert.equal(detail.sourceIssues[0]?.id, issue.id);
});
