// 工单系统 P0 服务接口骨架
// 仅作为实现准备，不绑定具体框架。

import type {
  AssignWorkItemInput,
  CancelWorkItemInput,
  CloseIssueInput,
  CreateIssueInput,
  CreateWorkItemInput,
  ID,
  Issue,
  IssueStatus,
  MetricSummary,
  PageRequest,
  PageResult,
  TriageToWorkItemInput,
  UpdateIssueInput,
  UpdateProgressInput,
  UpdateWorkItemInput,
  WorkItem,
  WorkItemStatus,
  WorkItemStatusMetrics,
  WorkItemType,
  WorkItemTypeMetrics,
} from './domain-types';

export interface RequestContext {
  userId: ID;
  teamIds: ID[];
  roles: string[];
  requestId: string;
  idempotencyKey?: string;
}

export interface IssueQuery extends PageRequest {
  keyword?: string;
  status?: IssueStatus;
  clueType?: string;
  priority?: string;
  submitterId?: ID;
  createdFrom?: string;
  createdTo?: string;
}

export interface WorkItemQuery extends PageRequest {
  keyword?: string;
  type?: WorkItemType;
  status?: WorkItemStatus;
  sourceType?: string;
  priority?: string;
  ownerId?: ID;
  assigneeId?: ID;
  teamId?: ID;
  isLeaf?: boolean;
  createdFrom?: string;
  createdTo?: string;
}

export interface IssueService {
  createIssue(input: CreateIssueInput, ctx: RequestContext): Promise<Issue>;
  updateIssue(issueId: ID, input: UpdateIssueInput, ctx: RequestContext): Promise<Issue>;
  listIssues(query: IssueQuery, ctx: RequestContext): Promise<PageResult<Issue>>;
  getIssue(issueId: ID, ctx: RequestContext): Promise<Issue>;
  closeIssue(issueId: ID, input: CloseIssueInput, ctx: RequestContext): Promise<Issue>;
}

export interface WorkItemService {
  createWorkItem(input: CreateWorkItemInput, ctx: RequestContext): Promise<WorkItem>;
  updateWorkItem(workItemId: ID, input: UpdateWorkItemInput, ctx: RequestContext): Promise<WorkItem>;
  listWorkItems(query: WorkItemQuery, ctx: RequestContext): Promise<PageResult<WorkItem>>;
  getWorkItem(workItemId: ID, ctx: RequestContext): Promise<WorkItem>;
}

export interface TriageService {
  triageToBusinessRequirement(issueId: ID, input: TriageToWorkItemInput, ctx: RequestContext): Promise<WorkItem>;
  triageToTechnicalRequirement(issueId: ID, input: TriageToWorkItemInput, ctx: RequestContext): Promise<WorkItem>;
  triageToDefect(issueId: ID, input: TriageToWorkItemInput, ctx: RequestContext): Promise<WorkItem>;
}

export interface WorkflowService {
  assign(workItemId: ID, input: AssignWorkItemInput, ctx: RequestContext): Promise<WorkItem>;
  start(workItemId: ID, note: string | undefined, ctx: RequestContext): Promise<WorkItem>;
  updateProgress(workItemId: ID, input: UpdateProgressInput, ctx: RequestContext): Promise<WorkItem>;
  complete(workItemId: ID, note: string | undefined, ctx: RequestContext): Promise<WorkItem>;
  cancel(workItemId: ID, input: CancelWorkItemInput, ctx: RequestContext): Promise<WorkItem>;
}

export interface MetricService {
  getSummary(ctx: RequestContext, filters?: MetricFilters): Promise<MetricSummary>;
  getWorkItemTypeMetrics(ctx: RequestContext, filters?: MetricFilters): Promise<WorkItemTypeMetrics>;
  getWorkItemStatusMetrics(ctx: RequestContext, filters?: MetricFilters): Promise<WorkItemStatusMetrics>;
}

export interface MetricFilters {
  teamId?: ID;
  createdFrom?: string;
  createdTo?: string;
}

export interface PermissionService {
  assertPermission(ctx: RequestContext, action: string, target?: PermissionTarget): Promise<void>;
  buildIssueScope(ctx: RequestContext): Promise<Record<string, unknown>>;
  buildWorkItemScope(ctx: RequestContext): Promise<Record<string, unknown>>;
}

export interface PermissionTarget {
  type: 'issue' | 'work_item' | 'metric' | 'view';
  id?: ID;
  teamId?: ID | null;
  ownerId?: ID | null;
  assigneeId?: ID | null;
  createdBy?: ID | null;
}

export interface StatusMachineService {
  validateIssueTransition(from: IssueStatus | null, to: IssueStatus, action: string): void;
  validateWorkItemTransition(from: WorkItemStatus, to: WorkItemStatus, action: string): void;
  getInitialWorkItemStatus(input: Pick<CreateWorkItemInput, 'assigneeId' | 'teamId'>): WorkItemStatus;
}
