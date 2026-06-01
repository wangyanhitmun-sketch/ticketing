import type { Issue, WorkItem, WorkItemStatus, WorkItemType } from '@ticketing/domain/domain-types';
import { AppError } from '../shared/errors.js';
import type { RequestContext } from '../shared/request-context.js';
import type { InMemoryIssueRepository } from '../issues/issue-repository.js';
import type { InMemoryIssueWorkItemSourceRepository } from '../sources/source-repository.js';
import { getInitialWorkItemStatus, validateCreateWorkItemInput } from '../work-items/work-item-policy.js';
import type { InMemoryWorkItemRepository } from '../work-items/work-item-repository.js';
import type { TriageResult, TriageTargetType, TriageWorkItemDto } from './triage-types.js';

export class TriageApplicationService {
  constructor(
    private readonly issueRepository: InMemoryIssueRepository,
    private readonly workItemRepository: InMemoryWorkItemRepository,
    private readonly sourceRepository: InMemoryIssueWorkItemSourceRepository,
  ) {}

  triageToBusinessRequirement(issueId: string, input: TriageWorkItemDto, ctx: RequestContext): TriageResult {
    return this.triage(issueId, 'business_requirement', input, ctx);
  }

  triageToTechnicalRequirement(issueId: string, input: TriageWorkItemDto, ctx: RequestContext): TriageResult {
    return this.triage(issueId, 'technical_requirement', input, ctx);
  }

  triageToDefect(issueId: string, input: TriageWorkItemDto, ctx: RequestContext): TriageResult {
    return this.triage(issueId, 'defect', input, ctx);
  }

  private triage(issueId: string, type: TriageTargetType, input: TriageWorkItemDto, ctx: RequestContext): TriageResult {
    const issue = this.requirePendingIssue(issueId);
    const draft = this.buildDraft(issue, type, input);
    const normalized = validateCreateWorkItemInput(draft);
    const status = getInitialWorkItemStatus(normalized);
    const workItem = this.createConvertedWorkItem(type, normalized, status, ctx);
    this.sourceRepository.create({
      issueId,
      workItemId: workItem.id,
      relationType: 'converted',
      createdBy: ctx.userId,
    });
    const convertedIssue = this.issueRepository.updateStatus(issueId, 'converted');
    if (!convertedIssue) {
      throw new AppError('NOT_FOUND', 'Issue not found', 404, { issueId });
    }
    this.issueRepository.createStatusLog({
      issueId,
      fromStatus: issue.status,
      toStatus: 'converted',
      operatorId: ctx.userId,
      reason: `triage_to_${type}`,
    });
    this.issueRepository.createAuditLog({
      targetType: 'issue',
      targetId: issueId,
      action: 'issue.triaged',
      operatorId: ctx.userId,
      detail: { workItemId: workItem.id, type },
    });
    return { issueId, issueStatus: convertedIssue.status, workItem };
  }

  private requirePendingIssue(issueId: string): Issue {
    const issue = this.issueRepository.findById(issueId);
    if (!issue) {
      throw new AppError('NOT_FOUND', 'Issue not found', 404, { issueId });
    }
    if (issue.status !== 'pending_triage') {
      throw new AppError('ISSUE_STATUS_INVALID', 'Only pending triage issue can be triaged', 409, { issueId, status: issue.status });
    }
    return issue;
  }

  private buildDraft(issue: Issue, type: TriageTargetType, input: TriageWorkItemDto) {
    return {
      ...input,
      type,
      title: input.title ?? issue.title,
      description: input.description ?? issue.description,
      priority: input.priority ?? issue.priority ?? undefined,
      impactScope: input.impactScope ?? issue.impactScope ?? undefined,
      expectedResult: input.expectedResult ?? issue.expectedResult ?? undefined,
      actualResult: input.actualResult ?? issue.actualResult ?? undefined,
      reproduceSteps: input.reproduceSteps ?? issue.reproduceSteps ?? undefined,
    };
  }

  private createConvertedWorkItem(type: WorkItemType, input: ReturnType<typeof validateCreateWorkItemInput>, status: WorkItemStatus, ctx: RequestContext): WorkItem {
    const workItem = this.workItemRepository.create({
      ...input,
      type,
      sourceType: 'issue_converted',
      status,
      progress: 0,
      level: 1,
      isLeaf: true,
      parentId: null,
      createdBy: ctx.userId,
    });
    this.workItemRepository.createStatusLog({
      workItemId: workItem.id,
      fromStatus: null,
      toStatus: status,
      operatorId: ctx.userId,
      reason: 'issue_triage',
    });
    this.workItemRepository.createAuditLog({
      targetType: 'work_item',
      targetId: workItem.id,
      action: 'work_item.created_from_issue',
      operatorId: ctx.userId,
      detail: { type, sourceType: 'issue_converted' },
    });
    return workItem;
  }
}
