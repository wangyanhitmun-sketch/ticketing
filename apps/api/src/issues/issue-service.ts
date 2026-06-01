import type { Issue } from '@ticketing/domain/domain-types';
import { AppError } from '../shared/errors.js';
import type { RequestContext } from '../shared/request-context.js';
import type { InMemoryIssueWorkItemSourceRepository } from '../sources/source-repository.js';
import type { InMemoryWorkItemRepository } from '../work-items/work-item-repository.js';
import { assertIssueClosable, assertIssueEditable, validateCloseIssueInput, validateCreateIssueInput } from './issue-policy.js';
import type { InMemoryIssueRepository } from './issue-repository.js';
import type { CloseIssueDto, CreateIssueDto, IssueDetail, IssueListResult, IssueQuery, UpdateIssueDto } from './issue-types.js';

export interface IssueApplicationServiceDependencies {
  sourceRepository?: InMemoryIssueWorkItemSourceRepository;
  workItemRepository?: InMemoryWorkItemRepository;
}

export class IssueApplicationService {
  constructor(
    private readonly repository: InMemoryIssueRepository,
    private readonly dependencies: IssueApplicationServiceDependencies = {},
  ) {}

  createIssue(input: CreateIssueDto, ctx: RequestContext): Issue {
    const normalized = validateCreateIssueInput(input);
    const issue = this.repository.create({
      ...normalized,
      status: 'pending_triage',
      submitterId: ctx.userId,
      createdBy: ctx.userId,
    });
    this.repository.createStatusLog({
      issueId: issue.id,
      fromStatus: null,
      toStatus: 'pending_triage',
      operatorId: ctx.userId,
      reason: null,
    });
    this.repository.createAuditLog({
      targetType: 'issue',
      targetId: issue.id,
      action: 'issue.created',
      operatorId: ctx.userId,
      detail: { issueNo: issue.issueNo },
    });
    return issue;
  }

  updateIssue(issueId: string, input: UpdateIssueDto, ctx: RequestContext): Issue {
    const issue = this.requireIssue(issueId);
    assertIssueEditable(issue.status);
    const updated = this.repository.update(issueId, input);
    if (!updated) {
      throw new AppError('NOT_FOUND', 'Issue not found', 404, { issueId });
    }
    this.repository.createAuditLog({
      targetType: 'issue',
      targetId: issueId,
      action: 'issue.updated',
      operatorId: ctx.userId,
      detail: { patch: input },
    });
    return updated;
  }

  listIssues(query: IssueQuery = {}): IssueListResult {
    return this.repository.list(query);
  }

  getIssue(issueId: string): IssueDetail {
    const issue = this.requireIssue(issueId);
    return {
      ...issue,
      statusLogs: this.repository.listStatusLogs(issueId),
      auditLogs: this.repository.listAuditLogs(issueId),
      relatedWorkItems: this.getRelatedWorkItems(issueId),
    };
  }

  closeIssue(issueId: string, input: CloseIssueDto, ctx: RequestContext): Issue {
    const issue = this.requireIssue(issueId);
    assertIssueClosable(issue.status);
    const normalized = validateCloseIssueInput(input);
    const closedAt = new Date().toISOString();
    const closed = this.repository.close(issueId, {
      ...normalized,
      closedBy: ctx.userId,
      closedAt,
    });
    if (!closed) {
      throw new AppError('NOT_FOUND', 'Issue not found', 404, { issueId });
    }
    this.repository.createStatusLog({
      issueId,
      fromStatus: issue.status,
      toStatus: 'closed',
      operatorId: ctx.userId,
      reason: normalized.closeReason ?? normalized.closeReasonType,
    });
    this.repository.createAuditLog({
      targetType: 'issue',
      targetId: issueId,
      action: 'issue.closed',
      operatorId: ctx.userId,
      detail: { ...normalized },
    });
    return closed;
  }

  private requireIssue(issueId: string): Issue {
    const issue = this.repository.findById(issueId);
    if (!issue) {
      throw new AppError('NOT_FOUND', 'Issue not found', 404, { issueId });
    }
    return issue;
  }

  private getRelatedWorkItems(issueId: string) {
    const sourceRepository = this.dependencies.sourceRepository;
    const workItemRepository = this.dependencies.workItemRepository;
    if (!sourceRepository || !workItemRepository) {
      return [];
    }
    return sourceRepository
      .listByIssueId(issueId)
      .map((relation) => workItemRepository.findById(relation.workItemId))
      .filter((workItem) => workItem !== null);
  }
}
