export type WorkItemType = 'business_requirement' | 'technical_requirement' | 'defect';
export type SourceType = 'issue_converted' | 'manual' | 'defect_to_requirement' | 'ai_created';
export type WorkItemStatus = 'unassigned' | 'ready_for_dev' | 'in_progress' | 'completed' | 'canceled';
export type Priority = 'P0' | 'P1' | 'P2' | 'P3';

export interface ApiEnvelope<T> {
  success: boolean;
  data: T | null;
  error: null | { code: string; message: string; details?: Record<string, unknown> };
  requestId: string;
}

export interface WorkItem {
  id: string;
  workItemNo: string;
  title: string;
  description: string;
  type: WorkItemType;
  sourceType: SourceType;
  status: WorkItemStatus;
  progress: number;
  priority?: Priority | null;
  ownerId?: string | null;
  assigneeId?: string | null;
  teamId?: string | null;
  parentId?: string | null;
  level: 1 | 2;
  isLeaf: boolean;
  dueDate?: string | null;
  businessCategory?: string | null;
  technicalCategory?: string | null;
  severity?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WorkItemDetail extends WorkItem {
  statusLogs: Array<{ id: string; targetId: string; toStatus: WorkItemStatus; operatorId: string; createdAt: string }>;
  progressLogs: Array<{ id: string; workItemId: string; fromProgress: number; toProgress: number; operatorId: string; createdAt: string }>;
  sourceIssues: [];
  children: WorkItem[];
  parent: WorkItem | null;
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
  page?: number;
  pageSize?: number;
}

export interface CreateWorkItemRequest {
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

export type UpdateWorkItemRequest = Partial<Omit<CreateWorkItemRequest, 'type'>>;
export interface PagedWorkItems { items: WorkItem[]; total: number }

export async function createWorkItem(input: CreateWorkItemRequest, baseUrl = '/api'): Promise<ApiEnvelope<WorkItem>> {
  return request<WorkItem>(`${baseUrl}/work-items`, { method: 'POST', body: JSON.stringify(input) });
}

export async function updateWorkItem(workItemId: string, input: UpdateWorkItemRequest, baseUrl = '/api'): Promise<ApiEnvelope<WorkItem>> {
  return request<WorkItem>(`${baseUrl}/work-items/${workItemId}`, { method: 'PUT', body: JSON.stringify(input) });
}

export async function listWorkItems(query: WorkItemQuery = {}, baseUrl = '/api'): Promise<ApiEnvelope<PagedWorkItems>> {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') params.set(key, String(value));
  });
  const suffix = params.size > 0 ? `?${params.toString()}` : '';
  return request<PagedWorkItems>(`${baseUrl}/work-items${suffix}`);
}

export async function getWorkItem(workItemId: string, baseUrl = '/api'): Promise<ApiEnvelope<WorkItemDetail>> {
  return request<WorkItemDetail>(`${baseUrl}/work-items/${workItemId}`);
}

async function request<T>(url: string, init: RequestInit = {}): Promise<ApiEnvelope<T>> {
  const response = await fetch(url, {
    ...init,
    headers: { 'content-type': 'application/json', ...init.headers },
  });
  return response.json() as Promise<ApiEnvelope<T>>;
}
