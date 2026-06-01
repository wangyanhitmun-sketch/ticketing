import type { WorkItem } from '@ticketing/domain/domain-types';
import type { InMemoryIssueRepository } from '../issues/issue-repository.js';
import { AppError } from '../shared/errors.js';
import type { RequestContext } from '../shared/request-context.js';
import type { InMemoryIssueWorkItemSourceRepository } from '../sources/source-repository.js';
import {
  assertNoImmutableWorkItemFields,
  getInitialWorkItemStatus,
  validateCreateWorkItemInput,
} from './work-item-policy.js';
import type { InMemoryWorkItemRepository } from './work-item-repository.js';
import type { CreateWorkItemDto, UpdateWorkItemDto, WorkItemDetail, WorkItemQuery } from './work-item-types.js';

export interface WorkItemApplicationServiceDependencies {
  sourceRepository?: InMemoryIssueWorkItemSourceRepository;
  issueRepository?: InMemoryIssueRepository;
}

export class WorkItemApplicationService {
  constructor(
    private readonly repository: InMemoryWorkItemRepository,
    private readonly dependencies: WorkItemApplicationServiceDependencies = {},
  ) {}

  createWorkItem(input: CreateWorkItemDto, ctx: RequestContext): WorkItem {
    const normalized = validateCreateWorkItemInput(input);
    const status = getInitialWorkItemStatus(normalized);
    const workItem = this.repository.create({
      ...normalized,
      sourceType: 'manual',
      status,
      progress: 0,
      level: 1,
      isLeaf: true,
      parentId: null,
      createdBy: ctx.userId,
    });
    this.repository.createStatusLog({
      workItemId: workItem.id,
      fromStatus: null,
      toStatus: status,
      operatorId: ctx.userId,
      reason: null,
    });
    this.repository.createAuditLog({
      targetType: 'work_item',
      targetId: workItem.id,
      action: 'work_item.created',
      operatorId: ctx.userId,
      detail: { workItemNo: workItem.workItemNo, type: workItem.type },
    });
    return workItem;
  }

  updateWorkItem(workItemId: string, input: UpdateWorkItemDto, ctx: RequestContext): WorkItem {
    this.requireWorkItem(workItemId);
    assertNoImmutableWorkItemFields(input);
    const updated = this.repository.update(workItemId, input);
    if (!updated) {
      throw new AppError('NOT_FOUND', 'Work item not found', 404, { workItemId });
    }
    this.repository.createAuditLog({
      targetType: 'work_item',
      targetId: workItemId,
      action: 'work_item.updated',
      operatorId: ctx.userId,
      detail: { patch: input },
    });
    return updated;
  }

  listWorkItems(query: WorkItemQuery = {}) {
    return this.repository.list(query);
  }

  getWorkItem(workItemId: string): WorkItemDetail {
    const workItem = this.requireWorkItem(workItemId);
    return {
      ...workItem,
      statusLogs: this.repository.listStatusLogs(workItemId),
      progressLogs: this.repository.listProgressLogs(workItemId),
      auditLogs: this.repository.listAuditLogs(workItemId),
      sourceIssues: this.getSourceIssues(workItemId),
      children: [],
      parent: null,
    };
  }

  private requireWorkItem(workItemId: string): WorkItem {
    const workItem = this.repository.findById(workItemId);
    if (!workItem) {
      throw new AppError('NOT_FOUND', 'Work item not found', 404, { workItemId });
    }
    return workItem;
  }

  private getSourceIssues(workItemId: string) {
    const sourceRepository = this.dependencies.sourceRepository;
    const issueRepository = this.dependencies.issueRepository;
    if (!sourceRepository || !issueRepository) {
      return [];
    }
    return sourceRepository
      .listByWorkItemId(workItemId)
      .map((relation) => issueRepository.findById(relation.issueId))
      .filter((issue) => issue !== null);
  }
}
