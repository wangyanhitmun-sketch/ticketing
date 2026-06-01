import type { ID, IssueWorkItemSource, SourceRelationType } from '@ticketing/domain/domain-types';
import { AppError } from '../shared/errors.js';

export interface CreateIssueWorkItemSourceRecord {
  issueId: ID;
  workItemId: ID;
  relationType: SourceRelationType;
  note?: string | null;
  createdBy: ID;
}

export interface IssueWorkItemSourceRepositoryOptions {
  now?: () => string;
}

export class InMemoryIssueWorkItemSourceRepository {
  private readonly relations: IssueWorkItemSource[] = [];
  private relationSeq = 1;
  private readonly now: () => string;

  constructor(options: IssueWorkItemSourceRepositoryOptions = {}) {
    this.now = options.now ?? (() => new Date().toISOString());
  }

  create(record: CreateIssueWorkItemSourceRecord): IssueWorkItemSource {
    const exists = this.relations.some((relation) => relation.issueId === record.issueId && relation.workItemId === record.workItemId);
    if (exists) {
      throw new AppError('SOURCE_RELATION_FAILED', 'Issue and work item source relation already exists', 409, {
        issueId: record.issueId,
        workItemId: record.workItemId,
      });
    }
    const relation: IssueWorkItemSource = {
      id: `issue-work-item-source-${this.relationSeq}`,
      issueId: record.issueId,
      workItemId: record.workItemId,
      relationType: record.relationType,
      note: record.note ?? null,
      createdBy: record.createdBy,
      createdAt: this.now(),
    };
    this.relationSeq += 1;
    this.relations.push(relation);
    return { ...relation };
  }

  listByIssueId(issueId: ID): IssueWorkItemSource[] {
    return this.relations.filter((relation) => relation.issueId === issueId).map((relation) => ({ ...relation }));
  }

  listByWorkItemId(workItemId: ID): IssueWorkItemSource[] {
    return this.relations.filter((relation) => relation.workItemId === workItemId).map((relation) => ({ ...relation }));
  }
}
