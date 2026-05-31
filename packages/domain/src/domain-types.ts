// 工单系统 P0 领域类型草案
// Source: architecture/数据模型.md + architecture/openapi/P0-openapi.yaml

export type ID = string;
export type ISODateTime = string;
export type ISODate = string;

export type Priority = 'P0' | 'P1' | 'P2' | 'P3';

export type ClueType = 'demand_clue' | 'defect_clue' | 'unknown';
export type IssueStatus = 'pending_triage' | 'converted' | 'closed';

export type WorkItemType =
  | 'business_requirement'
  | 'technical_requirement'
  | 'defect';

export type SourceType =
  | 'issue_converted'
  | 'manual'
  | 'defect_to_requirement'
  | 'ai_created';

export type WorkItemStatus =
  | 'unassigned'
  | 'ready_for_dev'
  | 'in_progress'
  | 'completed'
  | 'canceled';

export type SourceRelationType = 'converted' | 'associated' | 'merged_source';

export interface Team {
  id: ID;
  name: string;
  code: string;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface User {
  id: ID;
  name: string;
  username: string;
  email?: string | null;
  teamId?: ID | null;
  status: 'active' | 'inactive';
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface Issue {
  id: ID;
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
  closeReasonType?: string | null;
  closeReason?: string | null;
  closedBy?: ID | null;
  closedAt?: ISODateTime | null;
  createdBy: ID;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface WorkItem {
  id: ID;
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
  completedAt?: ISODateTime | null;
  canceledAt?: ISODateTime | null;
  cancelReasonType?: string | null;
  cancelReason?: string | null;
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
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface IssueWorkItemSource {
  id: ID;
  issueId: ID;
  workItemId: ID;
  relationType: SourceRelationType;
  note?: string | null;
  createdBy: ID;
  createdAt: ISODateTime;
}

export interface StatusLog<TStatus extends string = string> {
  id: ID;
  targetId: ID;
  fromStatus?: TStatus | null;
  toStatus: TStatus;
  operatorId: ID;
  reason?: string | null;
  createdAt: ISODateTime;
}

export interface WorkItemProgressLog {
  id: ID;
  workItemId: ID;
  fromProgress: number;
  toProgress: number;
  operatorId: ID;
  note?: string | null;
  createdAt: ISODateTime;
}

export interface AuditLog {
  id: ID;
  targetType: 'issue' | 'work_item' | 'view' | 'import_task' | string;
  targetId: ID;
  action: string;
  operatorId: ID;
  detail?: Record<string, unknown> | null;
  createdAt: ISODateTime;
}

export interface PageRequest {
  page?: number;
  pageSize?: number;
}

export interface PageResult<T> {
  items: T[];
  total: number;
}

export interface ApiError {
  code:
    | 'UNAUTHORIZED'
    | 'FORBIDDEN'
    | 'VALIDATION_ERROR'
    | 'NOT_FOUND'
    | 'CONFLICT'
    | 'ISSUE_STATUS_INVALID'
    | 'WORK_ITEM_STATUS_INVALID'
    | 'WORK_ITEM_NOT_LEAF'
    | 'SOURCE_RELATION_FAILED'
    | 'INTERNAL_ERROR';
  message: string;
  details?: Record<string, unknown>;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: ApiError | null;
  requestId: string;
}

export interface CreateIssueInput {
  title: string;
  description: string;
  clueType?: ClueType;
  priority?: Priority;
  category?: string;
  sourceChannel?: string;
  impactScope?: string;
  expectedResult?: string;
  actualResult?: string;
  reproduceSteps?: string;
  tags?: string[];
}

export type UpdateIssueInput = Partial<CreateIssueInput> & {
  title?: string;
  description?: string;
};

export interface CloseIssueInput {
  closeReasonType: string;
  closeReason?: string;
}

export interface CreateWorkItemInput {
  type: WorkItemType;
  title: string;
  description: string;
  priority?: Priority;
  ownerId?: ID | null;
  assigneeId?: ID | null;
  teamId?: ID | null;
  dueDate?: ISODate | null;
  impactScope?: string;
  businessCategory?: string;
  technicalCategory?: string;
  severity?: string;
  acceptanceCriteria?: string;
  completionCriteria?: string;
  riskNote?: string;
  expectedResult?: string;
  actualResult?: string;
  reproduceSteps?: string;
}

export type UpdateWorkItemInput = Partial<Omit<CreateWorkItemInput, 'type'>>;

export interface TriageToWorkItemInput extends Omit<CreateWorkItemInput, 'type'> {}

export interface AssignWorkItemInput {
  assigneeId?: ID | null;
  teamId?: ID | null;
  note?: string;
}

export interface UpdateProgressInput {
  progress: number;
  note?: string;
}

export interface CancelWorkItemInput {
  cancelReasonType: string;
  cancelReason?: string;
}

export interface MetricSummary {
  issueTotal: number;
  issuePendingTriage: number;
  issueConverted: number;
  issueClosed: number;
  workItemTotal: number;
  leafWorkItemTotal: number;
  parentWorkItemTotal: number;
  workItemStatus: WorkItemStatusMetrics;
}

export interface WorkItemTypeMetrics {
  businessRequirement: number;
  technicalRequirement: number;
  defect: number;
}

export interface WorkItemStatusMetrics {
  unassigned: number;
  readyForDev: number;
  inProgress: number;
  completed: number;
  canceled: number;
}
