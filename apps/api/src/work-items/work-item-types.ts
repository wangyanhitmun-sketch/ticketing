import type {
  AuditLog,
  Issue,
  Priority,
  SourceType,
  StatusLog,
  WorkItem,
  WorkItemProgressLog,
  WorkItemStatus,
  WorkItemType,
} from '@ticketing/domain/domain-types';

export interface CreateWorkItemDto {
  type: WorkItemType;
  title: string;
  description: string;
  priority?: Priority;
  ownerId?: string | null;
  assigneeId?: string | null;
  teamId?: string | null;
  dueDate?: string | null;
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

export type UpdateWorkItemDto = Partial<CreateWorkItemDto> & {
  sourceType?: SourceType;
  status?: WorkItemStatus;
  progress?: number;
  parentId?: string | null;
  level?: 1 | 2;
  isLeaf?: boolean;
  sourceDefectId?: string | null;
  aiCreationId?: string | null;
};

export interface NormalizedCreateWorkItemInput extends CreateWorkItemDto {
  priority: Priority;
  sourceType: 'manual';
}

export interface WorkItemQuery {
  keyword?: string;
  type?: WorkItemType;
  status?: WorkItemStatus;
  sourceType?: SourceType;
  priority?: Priority;
  ownerId?: string;
  assigneeId?: string;
  teamId?: string;
  isLeaf?: boolean;
  createdFrom?: string;
  createdTo?: string;
  page?: number;
  pageSize?: number;
}

export interface WorkItemDetail extends WorkItem {
  statusLogs: Array<StatusLog<WorkItemStatus>>;
  progressLogs: WorkItemProgressLog[];
  auditLogs: AuditLog[];
  sourceIssues: Issue[];
  children: WorkItem[];
  parent: WorkItem | null;
}
