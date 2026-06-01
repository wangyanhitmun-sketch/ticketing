import type {
  AuditLog,
  ClueType,
  Issue,
  IssueStatus,
  PageResult,
  Priority,
  StatusLog,
} from '@ticketing/domain/domain-types';

export interface CreateIssueDto {
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
}

export type UpdateIssueDto = Partial<CreateIssueDto>;

export interface IssueQuery {
  keyword?: string;
  status?: IssueStatus;
  clueType?: ClueType;
  priority?: Priority;
  submitterId?: string;
  createdFrom?: string;
  createdTo?: string;
  page?: number;
  pageSize?: number;
}

export interface CloseIssueDto {
  closeReasonType?: string;
  closeReason?: string;
}

export interface NormalizedCreateIssueInput extends CreateIssueDto {
  clueType: ClueType;
  priority: Priority;
  sourceChannel: string;
}

export interface NormalizedCloseIssueInput {
  closeReasonType?: string;
  closeReason?: string;
}

export interface IssueDetail extends Issue {
  statusLogs: Array<StatusLog<IssueStatus>>;
  auditLogs: AuditLog[];
  relatedWorkItems: [];
}

export type IssueListResult = PageResult<Issue>;
