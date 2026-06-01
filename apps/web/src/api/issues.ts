export type ClueType = 'demand_clue' | 'defect_clue' | 'unknown';
export type IssueStatus = 'pending_triage' | 'converted' | 'closed';
export type Priority = 'P0' | 'P1' | 'P2' | 'P3';

export interface ApiEnvelope<T> {
  success: boolean;
  data: T | null;
  error: null | { code: string; message: string; details?: Record<string, unknown> };
  requestId: string;
}

export interface Issue {
  id: string;
  issueNo: string;
  title: string;
  description: string;
  clueType: ClueType;
  status: IssueStatus;
  priority?: Priority | null;
  category?: string | null;
  sourceChannel?: string | null;
  submitterId: string;
  impactScope?: string | null;
  expectedResult?: string | null;
  actualResult?: string | null;
  reproduceSteps?: string | null;
  closeReasonType?: string | null;
  closeReason?: string | null;
  closedBy?: string | null;
  closedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IssueDetail extends Issue {
  statusLogs: Array<{
    id: string;
    targetId: string;
    fromStatus?: IssueStatus | null;
    toStatus: IssueStatus;
    operatorId: string;
    reason?: string | null;
    createdAt: string;
  }>;
  auditLogs: Array<{
    id: string;
    action: string;
    operatorId: string;
    createdAt: string;
  }>;
  relatedWorkItems: [];
}

export interface IssueQuery {
  keyword?: string;
  status?: IssueStatus;
  clueType?: ClueType;
  priority?: Priority;
  page?: number;
  pageSize?: number;
}

export interface CreateIssueRequest {
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

export type UpdateIssueRequest = Partial<CreateIssueRequest>;

export interface CloseIssueRequest {
  closeReasonType?: string;
  closeReason?: string;
}

export interface PagedIssues {
  items: Issue[];
  total: number;
}

export async function createIssue(input: CreateIssueRequest, baseUrl = '/api'): Promise<ApiEnvelope<Issue>> {
  return request<Issue>(`${baseUrl}/issues`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updateIssue(issueId: string, input: UpdateIssueRequest, baseUrl = '/api'): Promise<ApiEnvelope<Issue>> {
  return request<Issue>(`${baseUrl}/issues/${issueId}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
}

export async function listIssues(query: IssueQuery = {}, baseUrl = '/api'): Promise<ApiEnvelope<PagedIssues>> {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, String(value));
    }
  });
  const suffix = params.size > 0 ? `?${params.toString()}` : '';
  return request<PagedIssues>(`${baseUrl}/issues${suffix}`);
}

export async function getIssue(issueId: string, baseUrl = '/api'): Promise<ApiEnvelope<IssueDetail>> {
  return request<IssueDetail>(`${baseUrl}/issues/${issueId}`);
}

export async function closeIssue(issueId: string, input: CloseIssueRequest, baseUrl = '/api'): Promise<ApiEnvelope<Issue>> {
  return request<Issue>(`${baseUrl}/issues/${issueId}/close`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export interface TriageResult {
  issueId: string;
  issueStatus: IssueStatus;
  workItem: {
    id: string;
    workItemNo: string;
    title: string;
    type: 'business_requirement' | 'technical_requirement' | 'defect';
    sourceType: 'issue_converted';
    status: 'unassigned' | 'ready_for_dev' | 'in_progress' | 'completed' | 'canceled';
    progress: number;
  };
}

export type TriageIssueRequest = Partial<CreateIssueRequest> & {
  ownerId?: string | null;
  assigneeId?: string | null;
  teamId?: string | null;
  dueDate?: string | null;
  businessCategory?: string;
  technicalCategory?: string;
  severity?: string;
  acceptanceCriteria?: string;
  completionCriteria?: string;
  riskNote?: string;
};

export async function triageIssueToBusinessRequirement(issueId: string, input: TriageIssueRequest = {}, baseUrl = '/api'): Promise<ApiEnvelope<TriageResult>> {
  return request<TriageResult>(`${baseUrl}/issues/${issueId}/triage/business-requirement`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function triageIssueToTechnicalRequirement(issueId: string, input: TriageIssueRequest = {}, baseUrl = '/api'): Promise<ApiEnvelope<TriageResult>> {
  return request<TriageResult>(`${baseUrl}/issues/${issueId}/triage/technical-requirement`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function triageIssueToDefect(issueId: string, input: TriageIssueRequest = {}, baseUrl = '/api'): Promise<ApiEnvelope<TriageResult>> {
  return request<TriageResult>(`${baseUrl}/issues/${issueId}/triage/defect`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

async function request<T>(url: string, init: RequestInit = {}): Promise<ApiEnvelope<T>> {
  const response = await fetch(url, {
    ...init,
    headers: {
      'content-type': 'application/json',
      ...init.headers,
    },
  });
  return response.json() as Promise<ApiEnvelope<T>>;
}
