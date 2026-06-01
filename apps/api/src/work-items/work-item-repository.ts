import type {
  AuditLog,
  ID,
  SourceType,
  StatusLog,
  WorkItem,
  WorkItemProgressLog,
  WorkItemStatus,
  WorkItemType,
} from '@ticketing/domain/domain-types';
import type {
  CreateAuditLogRecord,
  CreateWorkItemStatusLogRecord,
  ListResult,
} from '@ticketing/domain/repository-interfaces';
import type { CreateWorkItemDto, UpdateWorkItemDto, WorkItemQuery } from './work-item-types.js';

export interface CreateWorkItemRecord extends CreateWorkItemDto {
  sourceType: SourceType;
  status: WorkItemStatus;
  progress: number;
  level: 1 | 2;
  isLeaf: boolean;
  parentId?: ID | null;
  createdBy: ID;
}

export interface WorkItemRepositoryOptions {
  now?: () => string;
}

export class InMemoryWorkItemRepository {
  private readonly workItems = new Map<ID, WorkItem>();
  private readonly statusLogs: Array<StatusLog<WorkItemStatus>> = [];
  private readonly progressLogs: WorkItemProgressLog[] = [];
  private readonly auditLogs: AuditLog[] = [];
  private workItemSeq = 1;
  private statusLogSeq = 1;
  private auditLogSeq = 1;
  private readonly now: () => string;

  constructor(options: WorkItemRepositoryOptions = {}) {
    this.now = options.now ?? (() => new Date().toISOString());
  }

  create(record: CreateWorkItemRecord): WorkItem {
    const now = this.now();
    const workItem: WorkItem = {
      id: `work-item-${this.workItemSeq}`,
      workItemNo: this.nextWorkItemNo(),
      title: record.title,
      description: record.description,
      type: record.type,
      sourceType: record.sourceType,
      status: record.status,
      progress: record.progress,
      priority: record.priority ?? null,
      ownerId: record.ownerId ?? null,
      assigneeId: record.assigneeId ?? null,
      teamId: record.teamId ?? null,
      parentId: record.parentId ?? null,
      level: record.level,
      isLeaf: record.isLeaf,
      dueDate: record.dueDate ?? null,
      completedAt: null,
      canceledAt: null,
      cancelReasonType: null,
      cancelReason: null,
      sourceDefectId: null,
      aiCreationId: null,
      businessCategory: record.businessCategory ?? null,
      technicalCategory: record.technicalCategory ?? null,
      severity: record.severity ?? null,
      acceptanceCriteria: record.acceptanceCriteria ?? null,
      completionCriteria: record.completionCriteria ?? null,
      riskNote: record.riskNote ?? null,
      expectedResult: record.expectedResult ?? null,
      actualResult: record.actualResult ?? null,
      reproduceSteps: record.reproduceSteps ?? null,
      impactScope: record.impactScope ?? null,
      createdBy: record.createdBy,
      createdAt: now,
      updatedAt: now,
    };
    this.workItemSeq += 1;
    this.workItems.set(workItem.id, workItem);
    return { ...workItem };
  }

  update(workItemId: ID, patch: UpdateWorkItemDto): WorkItem | null {
    const workItem = this.workItems.get(workItemId);
    if (!workItem) {
      return null;
    }
    const updated: WorkItem = {
      ...workItem,
      ...stripUndefined({
        title: patch.title,
        description: patch.description,
        priority: patch.priority,
        ownerId: patch.ownerId,
        assigneeId: patch.assigneeId,
        teamId: patch.teamId,
        dueDate: patch.dueDate,
        businessCategory: patch.businessCategory,
        technicalCategory: patch.technicalCategory,
        severity: patch.severity,
        acceptanceCriteria: patch.acceptanceCriteria,
        completionCriteria: patch.completionCriteria,
        riskNote: patch.riskNote,
        expectedResult: patch.expectedResult,
        actualResult: patch.actualResult,
        reproduceSteps: patch.reproduceSteps,
        impactScope: patch.impactScope,
      }),
      updatedAt: this.now(),
    };
    this.workItems.set(workItemId, updated);
    return { ...updated };
  }

  findById(workItemId: ID): WorkItem | null {
    const workItem = this.workItems.get(workItemId);
    return workItem ? { ...workItem } : null;
  }

  list(filters: WorkItemQuery = {}): ListResult<WorkItem> {
    const page = Math.max(filters.page ?? 1, 1);
    const pageSize = Math.max(filters.pageSize ?? 20, 1);
    const keyword = filters.keyword?.trim().toLowerCase();
    const createdFrom = filters.createdFrom ? new Date(filters.createdFrom).getTime() : null;
    const createdTo = filters.createdTo ? new Date(filters.createdTo).getTime() : null;

    const matched = [...this.workItems.values()]
      .filter((item) => !filters.type || item.type === filters.type)
      .filter((item) => !filters.status || item.status === filters.status)
      .filter((item) => !filters.sourceType || item.sourceType === filters.sourceType)
      .filter((item) => !filters.priority || item.priority === filters.priority)
      .filter((item) => !filters.ownerId || item.ownerId === filters.ownerId)
      .filter((item) => !filters.assigneeId || item.assigneeId === filters.assigneeId)
      .filter((item) => !filters.teamId || item.teamId === filters.teamId)
      .filter((item) => filters.isLeaf === undefined || item.isLeaf === filters.isLeaf)
      .filter((item) => !keyword || `${item.title} ${item.description}`.toLowerCase().includes(keyword))
      .filter((item) => createdFrom === null || new Date(item.createdAt).getTime() >= createdFrom)
      .filter((item) => createdTo === null || new Date(item.createdAt).getTime() <= createdTo)
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt) || right.workItemNo.localeCompare(left.workItemNo));

    const start = (page - 1) * pageSize;
    return {
      items: matched.slice(start, start + pageSize).map((item) => ({ ...item })),
      total: matched.length,
    };
  }

  createStatusLog(record: CreateWorkItemStatusLogRecord): StatusLog<WorkItemStatus> {
    const log: StatusLog<WorkItemStatus> = {
      id: `work-item-status-log-${this.statusLogSeq}`,
      targetId: record.workItemId,
      fromStatus: record.fromStatus ?? null,
      toStatus: record.toStatus,
      operatorId: record.operatorId,
      reason: record.reason ?? null,
      createdAt: this.now(),
    };
    this.statusLogSeq += 1;
    this.statusLogs.push(log);
    return { ...log };
  }

  listStatusLogs(workItemId: ID): Array<StatusLog<WorkItemStatus>> {
    return this.statusLogs.filter((log) => log.targetId === workItemId).map((log) => ({ ...log }));
  }

  listProgressLogs(workItemId: ID): WorkItemProgressLog[] {
    return this.progressLogs.filter((log) => log.workItemId === workItemId).map((log) => ({ ...log }));
  }

  createAuditLog(record: CreateAuditLogRecord): AuditLog {
    const log: AuditLog = {
      id: `audit-log-${this.auditLogSeq}`,
      targetType: record.targetType,
      targetId: record.targetId,
      action: record.action,
      operatorId: record.operatorId,
      detail: record.detail ?? null,
      createdAt: this.now(),
    };
    this.auditLogSeq += 1;
    this.auditLogs.push(log);
    return { ...log };
  }

  listAuditLogs(workItemId: ID): AuditLog[] {
    return this.auditLogs.filter((log) => log.targetType === 'work_item' && log.targetId === workItemId).map((log) => ({ ...log }));
  }

  private nextWorkItemNo(): string {
    return `WI-${String(this.workItemSeq).padStart(6, '0')}`;
  }
}

function stripUndefined<T extends Record<string, unknown>>(value: T): Partial<T> {
  return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined)) as Partial<T>;
}
