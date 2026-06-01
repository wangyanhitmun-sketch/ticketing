// 工单系统 Repository 接口骨架
// Source: architecture/数据模型.md + development/服务端模块设计.md
// 仅定义数据访问边界，不绑定具体 ORM / SQL 框架。

import type {
  AuditLog,
  ClueType,
  ID,
  ISODate,
  ISODateTime,
  Issue,
  IssueStatus,
  IssueWorkItemSource,
  Priority,
  SourceRelationType,
  SourceType,
  StatusLog,
  User,
  WorkItem,
  WorkItemProgressLog,
  WorkItemStatus,
  WorkItemStatusMetrics,
  WorkItemType,
  WorkItemTypeMetrics,
} from './domain-types.js';

export interface TransactionContext {
  readonly txId?: string;
  readonly client?: unknown;
}

export interface ListResult<T> {
  items: T[];
  total: number;
}

export interface PageParams {
  page?: number;
  pageSize?: number;
}

export interface SortParams<TSortBy extends string = string> {
  sortBy?: TSortBy;
  sortOrder?: 'asc' | 'desc';
}

export interface DateRangeFilter {
  createdFrom?: ISODateTime | string;
  createdTo?: ISODateTime | string;
}

export interface TransactionManager {
  runInTransaction<T>(handler: (tx: TransactionContext) => Promise<T>): Promise<T>;
}

export interface IssueFilters extends PageParams, SortParams<'createdAt' | 'updatedAt' | 'priority'>, DateRangeFilter {
  keyword?: string;
  status?: IssueStatus;
  clueType?: ClueType;
  priority?: Priority;
  submitterId?: ID;
  createdBy?: ID;
  category?: string;
  sourceChannel?: string;
  externalNo?: string;
  scope?: DataScopeFilter;
}

export interface WorkItemFilters extends PageParams, SortParams<'createdAt' | 'updatedAt' | 'priority' | 'dueDate'>, DateRangeFilter {
  keyword?: string;
  type?: WorkItemType;
  status?: WorkItemStatus;
  sourceType?: SourceType;
  priority?: Priority;
  ownerId?: ID;
  assigneeId?: ID;
  teamId?: ID;
  parentId?: ID | null;
  isLeaf?: boolean;
  level?: 1 | 2;
  dueFrom?: ISODate | string;
  dueTo?: ISODate | string;
  scope?: DataScopeFilter;
}

export interface DataScopeFilter {
  visibleUserIds?: ID[];
  visibleTeamIds?: ID[];
  createdByIds?: ID[];
  submitterIds?: ID[];
  unrestricted?: boolean;
}

export interface CreateIssueRecord {
  issueNo: string;
  title: string;
  description: string;
  clueType: ClueType;
  status: IssueStatus;
  priority?: Priority | null;
  category?: string | null;
  sourceChannel?: string | null;
  submitterId: ID;
  originalSubmitterText?: string | null;
  impactScope?: string | null;
  expectedResult?: string | null;
  actualResult?: string | null;
  reproduceSteps?: string | null;
  externalNo?: string | null;
  createdBy: ID;
}

export interface UpdateIssueRecord {
  title?: string;
  description?: string;
  clueType?: ClueType;
  priority?: Priority | null;
  category?: string | null;
  sourceChannel?: string | null;
  impactScope?: string | null;
  expectedResult?: string | null;
  actualResult?: string | null;
  reproduceSteps?: string | null;
  externalNo?: string | null;
  updatedAt?: ISODateTime;
}

export interface CloseIssueRecord {
  status: 'closed';
  closeReasonType: string;
  closeReason?: string | null;
  closedBy: ID;
  closedAt: ISODateTime;
}

export interface UpdateIssueStatusRecord {
  status: IssueStatus;
  updatedAt?: ISODateTime;
}

export interface CreateWorkItemRecord {
  workItemNo: string;
  title: string;
  description: string;
  type: WorkItemType;
  sourceType: SourceType;
  status: WorkItemStatus;
  progress: number;
  priority?: Priority | null;
  ownerId?: ID | null;
  assigneeId?: ID | null;
  teamId?: ID | null;
  parentId?: ID | null;
  level: 1 | 2;
  isLeaf: boolean;
  dueDate?: ISODate | null;
  sourceDefectId?: ID | null;
  aiCreationId?: ID | null;
  businessCategory?: string | null;
  technicalCategory?: string | null;
  severity?: string | null;
  acceptanceCriteria?: string | null;
  completionCriteria?: string | null;
  riskNote?: string | null;
  expectedResult?: string | null;
  actualResult?: string | null;
  reproduceSteps?: string | null;
  impactScope?: string | null;
  createdBy: ID;
}

export interface UpdateWorkItemRecord {
  title?: string;
  description?: string;
  priority?: Priority | null;
  ownerId?: ID | null;
  assigneeId?: ID | null;
  teamId?: ID | null;
  dueDate?: ISODate | null;
  businessCategory?: string | null;
  technicalCategory?: string | null;
  severity?: string | null;
  acceptanceCriteria?: string | null;
  completionCriteria?: string | null;
  riskNote?: string | null;
  expectedResult?: string | null;
  actualResult?: string | null;
  reproduceSteps?: string | null;
  impactScope?: string | null;
  updatedAt?: ISODateTime;
}

export interface UpdateWorkItemWorkflowRecord {
  status?: WorkItemStatus;
  progress?: number;
  assigneeId?: ID | null;
  teamId?: ID | null;
  completedAt?: ISODateTime | null;
  canceledAt?: ISODateTime | null;
  cancelReasonType?: string | null;
  cancelReason?: string | null;
  updatedAt?: ISODateTime;
}

export interface UpdateWorkItemHierarchyRecord {
  parentId?: ID | null;
  level?: 1 | 2;
  isLeaf?: boolean;
  status?: WorkItemStatus;
  progress?: number;
  updatedAt?: ISODateTime;
}

export interface CreateIssueWorkItemSourceRecord {
  issueId: ID;
  workItemId: ID;
  relationType: SourceRelationType;
  note?: string | null;
  createdBy: ID;
}

export type WorkItemRelationType = 'defect_to_requirement' | 'split_from' | 'relates_to';

export interface WorkItemRelation {
  id: ID;
  sourceWorkItemId: ID;
  targetWorkItemId: ID;
  relationType: WorkItemRelationType;
  note?: string | null;
  createdBy: ID;
  createdAt: ISODateTime;
}

export interface CreateWorkItemRelationRecord {
  sourceWorkItemId: ID;
  targetWorkItemId: ID;
  relationType: WorkItemRelationType;
  note?: string | null;
  createdBy: ID;
}

export interface CreateIssueStatusLogRecord {
  issueId: ID;
  fromStatus?: IssueStatus | null;
  toStatus: IssueStatus;
  operatorId: ID;
  reason?: string | null;
}

export interface CreateWorkItemStatusLogRecord {
  workItemId: ID;
  fromStatus?: WorkItemStatus | null;
  toStatus: WorkItemStatus;
  operatorId: ID;
  reason?: string | null;
}

export interface CreateWorkItemProgressLogRecord {
  workItemId: ID;
  fromProgress: number;
  toProgress: number;
  operatorId: ID;
  note?: string | null;
}

export interface CreateAuditLogRecord {
  targetType: 'issue' | 'work_item' | 'view' | 'import_task' | string;
  targetId: ID;
  action: string;
  operatorId: ID;
  detail?: Record<string, unknown> | null;
}

export interface MetricFilters extends DateRangeFilter {
  teamId?: ID;
  assigneeId?: ID;
  ownerId?: ID;
  type?: WorkItemType;
  status?: WorkItemStatus;
  isLeaf?: boolean;
  scope?: DataScopeFilter;
}

export interface MetricSummaryRow {
  issueTotal: number;
  issuePendingTriage: number;
  issueConverted: number;
  issueClosed: number;
  workItemTotal: number;
  leafWorkItemTotal: number;
  parentWorkItemTotal: number;
}

export interface IssueRepository {
  nextIssueNo(tx?: TransactionContext): Promise<string>;
  create(record: CreateIssueRecord, tx?: TransactionContext): Promise<Issue>;
  update(issueId: ID, patch: UpdateIssueRecord, tx?: TransactionContext): Promise<Issue>;
  updateStatus(issueId: ID, patch: UpdateIssueStatusRecord, tx?: TransactionContext): Promise<Issue>;
  close(issueId: ID, patch: CloseIssueRecord, tx?: TransactionContext): Promise<Issue>;
  findById(issueId: ID, tx?: TransactionContext): Promise<Issue | null>;
  findByIdForUpdate(issueId: ID, tx: TransactionContext): Promise<Issue | null>;
  findByNo(issueNo: string, tx?: TransactionContext): Promise<Issue | null>;
  list(filters: IssueFilters, tx?: TransactionContext): Promise<ListResult<Issue>>;
  softDelete(issueId: ID, operatorId: ID, tx?: TransactionContext): Promise<void>;
}

export interface WorkItemRepository {
  nextWorkItemNo(tx?: TransactionContext): Promise<string>;
  create(record: CreateWorkItemRecord, tx?: TransactionContext): Promise<WorkItem>;
  update(workItemId: ID, patch: UpdateWorkItemRecord, tx?: TransactionContext): Promise<WorkItem>;
  updateWorkflow(workItemId: ID, patch: UpdateWorkItemWorkflowRecord, tx?: TransactionContext): Promise<WorkItem>;
  updateHierarchy(workItemId: ID, patch: UpdateWorkItemHierarchyRecord, tx?: TransactionContext): Promise<WorkItem>;
  findById(workItemId: ID, tx?: TransactionContext): Promise<WorkItem | null>;
  findByIdForUpdate(workItemId: ID, tx: TransactionContext): Promise<WorkItem | null>;
  findByNo(workItemNo: string, tx?: TransactionContext): Promise<WorkItem | null>;
  list(filters: WorkItemFilters, tx?: TransactionContext): Promise<ListResult<WorkItem>>;
  listChildren(parentId: ID, tx?: TransactionContext): Promise<WorkItem[]>;
  listChildrenForUpdate(parentId: ID, tx: TransactionContext): Promise<WorkItem[]>;
  softDelete(workItemId: ID, operatorId: ID, tx?: TransactionContext): Promise<void>;
}

export interface IssueWorkItemSourceRepository {
  create(record: CreateIssueWorkItemSourceRecord, tx?: TransactionContext): Promise<IssueWorkItemSource>;
  findByIssueAndWorkItem(issueId: ID, workItemId: ID, tx?: TransactionContext): Promise<IssueWorkItemSource | null>;
  listByIssueId(issueId: ID, tx?: TransactionContext): Promise<IssueWorkItemSource[]>;
  listByWorkItemId(workItemId: ID, tx?: TransactionContext): Promise<IssueWorkItemSource[]>;
  deleteRelation(relationId: ID, tx?: TransactionContext): Promise<void>;
}

export interface WorkItemRelationRepository {
  create(record: CreateWorkItemRelationRecord, tx?: TransactionContext): Promise<WorkItemRelation>;
  findRelation(sourceWorkItemId: ID, targetWorkItemId: ID, relationType: WorkItemRelationType, tx?: TransactionContext): Promise<WorkItemRelation | null>;
  listBySourceWorkItemId(sourceWorkItemId: ID, tx?: TransactionContext): Promise<WorkItemRelation[]>;
  listByTargetWorkItemId(targetWorkItemId: ID, tx?: TransactionContext): Promise<WorkItemRelation[]>;
  deleteRelation(relationId: ID, tx?: TransactionContext): Promise<void>;
}

export interface IssueStatusLogRepository {
  create(record: CreateIssueStatusLogRecord, tx?: TransactionContext): Promise<StatusLog<IssueStatus>>;
  listByIssueId(issueId: ID, tx?: TransactionContext): Promise<Array<StatusLog<IssueStatus>>>;
  findLatest(issueId: ID, tx?: TransactionContext): Promise<StatusLog<IssueStatus> | null>;
}

export interface WorkItemStatusLogRepository {
  create(record: CreateWorkItemStatusLogRecord, tx?: TransactionContext): Promise<StatusLog<WorkItemStatus>>;
  listByWorkItemId(workItemId: ID, tx?: TransactionContext): Promise<Array<StatusLog<WorkItemStatus>>>;
  findLatest(workItemId: ID, tx?: TransactionContext): Promise<StatusLog<WorkItemStatus> | null>;
}

export interface WorkItemProgressLogRepository {
  create(record: CreateWorkItemProgressLogRecord, tx?: TransactionContext): Promise<WorkItemProgressLog>;
  listByWorkItemId(workItemId: ID, tx?: TransactionContext): Promise<WorkItemProgressLog[]>;
  findLatest(workItemId: ID, tx?: TransactionContext): Promise<WorkItemProgressLog | null>;
}

export interface AuditLogRepository {
  create(record: CreateAuditLogRecord, tx?: TransactionContext): Promise<AuditLog>;
  listByTarget(targetType: string, targetId: ID, tx?: TransactionContext): Promise<AuditLog[]>;
  listByOperator(operatorId: ID, filters?: DateRangeFilter, tx?: TransactionContext): Promise<ListResult<AuditLog>>;
}

export interface MetricRepository {
  getSummary(filters?: MetricFilters, tx?: TransactionContext): Promise<MetricSummaryRow>;
  countWorkItemsByType(filters?: MetricFilters, tx?: TransactionContext): Promise<WorkItemTypeMetrics>;
  countWorkItemsByStatus(filters?: MetricFilters, tx?: TransactionContext): Promise<WorkItemStatusMetrics>;
  countIssuesByStatus(filters?: MetricFilters, tx?: TransactionContext): Promise<Record<IssueStatus, number>>;
}

export type ViewType = 'list' | 'table' | 'board';
export type ViewScope = 'personal' | 'team';

export interface ViewConfig {
  id: ID;
  name: string;
  viewType: ViewType;
  scope: ViewScope;
  ownerId?: ID | null;
  teamId?: ID | null;
  filters: Record<string, unknown>;
  groupBy?: Record<string, unknown> | null;
  sortBy?: Record<string, unknown> | null;
  visibleFields?: string[] | null;
  createdBy: ID;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface CreateViewConfigRecord {
  name: string;
  viewType: ViewType;
  scope: ViewScope;
  ownerId?: ID | null;
  teamId?: ID | null;
  filters?: Record<string, unknown>;
  groupBy?: Record<string, unknown> | null;
  sortBy?: Record<string, unknown> | null;
  visibleFields?: string[] | null;
  createdBy: ID;
}

export interface UpdateViewConfigRecord {
  name?: string;
  viewType?: ViewType;
  filters?: Record<string, unknown>;
  groupBy?: Record<string, unknown> | null;
  sortBy?: Record<string, unknown> | null;
  visibleFields?: string[] | null;
}

export interface ViewConfigRepository {
  create(record: CreateViewConfigRecord, tx?: TransactionContext): Promise<ViewConfig>;
  update(viewId: ID, patch: UpdateViewConfigRecord, tx?: TransactionContext): Promise<ViewConfig>;
  findById(viewId: ID, tx?: TransactionContext): Promise<ViewConfig | null>;
  listByOwner(ownerId: ID, tx?: TransactionContext): Promise<ViewConfig[]>;
  listByTeam(teamId: ID, tx?: TransactionContext): Promise<ViewConfig[]>;
  convertPersonalToTeam(viewId: ID, teamId: ID, operatorId: ID, tx?: TransactionContext): Promise<ViewConfig>;
  softDelete(viewId: ID, operatorId: ID, tx?: TransactionContext): Promise<void>;
}

export interface Attachment {
  id: ID;
  targetType: 'issue' | 'work_item';
  targetId: ID;
  fileName: string;
  fileUrl: string;
  fileSize?: number | null;
  mimeType?: string | null;
  uploaderId: ID;
  createdAt: ISODateTime;
}

export interface CreateAttachmentRecord {
  targetType: 'issue' | 'work_item';
  targetId: ID;
  fileName: string;
  fileUrl: string;
  fileSize?: number | null;
  mimeType?: string | null;
  uploaderId: ID;
}

export interface AttachmentRepository {
  create(record: CreateAttachmentRecord, tx?: TransactionContext): Promise<Attachment>;
  listByTarget(targetType: 'issue' | 'work_item', targetId: ID, tx?: TransactionContext): Promise<Attachment[]>;
  softDelete(attachmentId: ID, operatorId: ID, tx?: TransactionContext): Promise<void>;
}

export interface Comment {
  id: ID;
  targetType: 'issue' | 'work_item';
  targetId: ID;
  content: string;
  creatorId: ID;
  createdAt: ISODateTime;
  updatedAt?: ISODateTime | null;
}

export interface CreateCommentRecord {
  targetType: 'issue' | 'work_item';
  targetId: ID;
  content: string;
  creatorId: ID;
}

export interface CommentRepository {
  create(record: CreateCommentRecord, tx?: TransactionContext): Promise<Comment>;
  update(commentId: ID, content: string, operatorId: ID, tx?: TransactionContext): Promise<Comment>;
  listByTarget(targetType: 'issue' | 'work_item', targetId: ID, tx?: TransactionContext): Promise<Comment[]>;
  softDelete(commentId: ID, operatorId: ID, tx?: TransactionContext): Promise<void>;
}

export interface AiCreationRecord {
  id: ID;
  rawInput: string;
  suggestedType?: WorkItemType | null;
  generatedDraft: Record<string, unknown>;
  finalContent?: Record<string, unknown> | null;
  confirmedBy?: ID | null;
  confirmedAt?: ISODateTime | null;
  modelInfo?: string | null;
  createdAt: ISODateTime;
}

export interface CreateAiCreationRecord {
  rawInput: string;
  suggestedType?: WorkItemType | null;
  generatedDraft: Record<string, unknown>;
  modelInfo?: string | null;
}

export interface ConfirmAiCreationRecord {
  finalContent: Record<string, unknown>;
  confirmedBy: ID;
  confirmedAt: ISODateTime;
}

export interface AiCreationRecordRepository {
  create(record: CreateAiCreationRecord, tx?: TransactionContext): Promise<AiCreationRecord>;
  confirm(recordId: ID, patch: ConfirmAiCreationRecord, tx?: TransactionContext): Promise<AiCreationRecord>;
  findById(recordId: ID, tx?: TransactionContext): Promise<AiCreationRecord | null>;
}

export interface UserRepository {
  findById(userId: ID, tx?: TransactionContext): Promise<User | null>;
  listByTeamId(teamId: ID, tx?: TransactionContext): Promise<User[]>;
}
