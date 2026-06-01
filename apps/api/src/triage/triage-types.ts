import type { IssueStatus, WorkItem, WorkItemType } from '@ticketing/domain/domain-types';
import type { CreateWorkItemDto } from '../work-items/work-item-types.js';

export type TriageTargetType = Extract<WorkItemType, 'business_requirement' | 'technical_requirement' | 'defect'>;
export type TriageWorkItemDto = Partial<Omit<CreateWorkItemDto, 'type'>>;

export interface TriageResult {
  issueId: string;
  issueStatus: IssueStatus;
  workItem: WorkItem;
}
