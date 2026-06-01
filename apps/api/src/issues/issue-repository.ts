import type {
  AuditLog,
  ID,
  Issue,
  IssueStatus,
  StatusLog,
} from '@ticketing/domain/domain-types';
import type {
  CreateAuditLogRecord,
  CreateIssueStatusLogRecord,
  IssueFilters,
  ListResult,
} from '@ticketing/domain/repository-interfaces';
import type { CreateIssueDto, UpdateIssueDto } from './issue-types.js';

export interface CreateIssueRecord extends CreateIssueDto {
  status: IssueStatus;
  submitterId: ID;
  createdBy: ID;
}

export interface IssueRepositoryOptions {
  now?: () => string;
}

export class InMemoryIssueRepository {
  private readonly issues = new Map<ID, Issue>();
  private readonly statusLogs: Array<StatusLog<IssueStatus>> = [];
  private readonly auditLogs: AuditLog[] = [];
  private issueSeq = 1;
  private statusLogSeq = 1;
  private auditLogSeq = 1;
  private readonly now: () => string;

  constructor(options: IssueRepositoryOptions = {}) {
    this.now = options.now ?? (() => new Date().toISOString());
  }

  create(record: CreateIssueRecord): Issue {
    const now = this.now();
    const issue: Issue = {
      id: `issue-${this.issueSeq}`,
      issueNo: this.nextIssueNo(),
      title: record.title,
      description: record.description,
      clueType: record.clueType ?? 'unknown',
      status: record.status,
      priority: record.priority ?? null,
      category: record.category ?? null,
      sourceChannel: record.sourceChannel ?? null,
      submitterId: record.submitterId,
      originalSubmitterText: null,
      impactScope: record.impactScope ?? null,
      expectedResult: record.expectedResult ?? null,
      actualResult: record.actualResult ?? null,
      reproduceSteps: record.reproduceSteps ?? null,
      externalNo: null,
      closeReasonType: null,
      closeReason: null,
      closedBy: null,
      closedAt: null,
      createdBy: record.createdBy,
      createdAt: now,
      updatedAt: now,
    };
    this.issueSeq += 1;
    this.issues.set(issue.id, issue);
    return { ...issue };
  }

  update(issueId: ID, patch: UpdateIssueDto): Issue | null {
    const issue = this.issues.get(issueId);
    if (!issue) {
      return null;
    }
    const updated: Issue = {
      ...issue,
      ...stripUndefined({
        title: patch.title,
        description: patch.description,
        clueType: patch.clueType,
        priority: patch.priority,
        category: patch.category,
        sourceChannel: patch.sourceChannel,
        impactScope: patch.impactScope,
        expectedResult: patch.expectedResult,
        actualResult: patch.actualResult,
        reproduceSteps: patch.reproduceSteps,
      }),
      updatedAt: this.now(),
    };
    this.issues.set(issueId, updated);
    return { ...updated };
  }

  close(issueId: ID, patch: { closeReasonType?: string; closeReason?: string; closedBy: ID; closedAt?: string }): Issue | null {
    const issue = this.issues.get(issueId);
    if (!issue) {
      return null;
    }
    const closedAt = patch.closedAt ?? this.now();
    const updated: Issue = {
      ...issue,
      status: 'closed',
      closeReasonType: patch.closeReasonType ?? null,
      closeReason: patch.closeReason ?? null,
      closedBy: patch.closedBy,
      closedAt,
      updatedAt: closedAt,
    };
    this.issues.set(issueId, updated);
    return { ...updated };
  }

  findById(issueId: ID): Issue | null {
    const issue = this.issues.get(issueId);
    return issue ? { ...issue } : null;
  }

  list(filters: IssueFilters = {}): ListResult<Issue> {
    const page = Math.max(filters.page ?? 1, 1);
    const pageSize = Math.max(filters.pageSize ?? 20, 1);
    const keyword = filters.keyword?.trim().toLowerCase();
    const createdFrom = filters.createdFrom ? new Date(filters.createdFrom).getTime() : null;
    const createdTo = filters.createdTo ? new Date(filters.createdTo).getTime() : null;

    const matched = [...this.issues.values()]
      .filter((issue) => !filters.status || issue.status === filters.status)
      .filter((issue) => !filters.clueType || issue.clueType === filters.clueType)
      .filter((issue) => !filters.priority || issue.priority === filters.priority)
      .filter((issue) => !filters.submitterId || issue.submitterId === filters.submitterId)
      .filter((issue) => !filters.category || issue.category === filters.category)
      .filter((issue) => !keyword || `${issue.title} ${issue.description}`.toLowerCase().includes(keyword))
      .filter((issue) => createdFrom === null || new Date(issue.createdAt).getTime() >= createdFrom)
      .filter((issue) => createdTo === null || new Date(issue.createdAt).getTime() <= createdTo)
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt) || right.issueNo.localeCompare(left.issueNo));

    const start = (page - 1) * pageSize;
    return {
      items: matched.slice(start, start + pageSize).map((issue) => ({ ...issue })),
      total: matched.length,
    };
  }

  createStatusLog(record: Omit<CreateIssueStatusLogRecord, 'issueId'> & { targetId?: ID; issueId?: ID }): StatusLog<IssueStatus> {
    const log: StatusLog<IssueStatus> = {
      id: `issue-status-log-${this.statusLogSeq}`,
      targetId: record.issueId ?? record.targetId ?? '',
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

  listStatusLogs(issueId: ID): Array<StatusLog<IssueStatus>> {
    return this.statusLogs.filter((log) => log.targetId === issueId).map((log) => ({ ...log }));
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

  listAuditLogs(issueId: ID): AuditLog[] {
    return this.auditLogs.filter((log) => log.targetType === 'issue' && log.targetId === issueId).map((log) => ({ ...log }));
  }

  private nextIssueNo(): string {
    return `ISSUE-${String(this.issueSeq).padStart(6, '0')}`;
  }
}

function stripUndefined<T extends Record<string, unknown>>(value: T): Partial<T> {
  return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined)) as Partial<T>;
}
