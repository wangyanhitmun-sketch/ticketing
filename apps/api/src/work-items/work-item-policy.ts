import type { WorkItemStatus, WorkItemType } from '@ticketing/domain/domain-types';
import { AppError } from '../shared/errors.js';
import type { CreateWorkItemDto, NormalizedCreateWorkItemInput, UpdateWorkItemDto } from './work-item-types.js';

const allowedWorkItemTypes = new Set<WorkItemType>(['business_requirement', 'technical_requirement', 'defect']);
const immutableFields = ['type', 'sourceType', 'sourceDefectId', 'aiCreationId', 'status', 'progress', 'parentId', 'level', 'isLeaf'];

function requiredText(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new AppError('VALIDATION_ERROR', `${field} is required`, 400, { field });
  }
  return value.trim();
}

function optionalText(value: string | null | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export function validateCreateWorkItemInput(input: CreateWorkItemDto): NormalizedCreateWorkItemInput {
  if (!allowedWorkItemTypes.has(input.type)) {
    throw new AppError('VALIDATION_ERROR', 'type is invalid', 400, { field: 'type' });
  }
  return {
    ...input,
    title: requiredText(input.title, 'title'),
    description: requiredText(input.description, 'description'),
    ownerId: optionalText(input.ownerId),
    assigneeId: optionalText(input.assigneeId),
    teamId: optionalText(input.teamId),
    dueDate: optionalText(input.dueDate),
    impactScope: optionalText(input.impactScope),
    businessCategory: optionalText(input.businessCategory),
    technicalCategory: optionalText(input.technicalCategory),
    severity: optionalText(input.severity),
    acceptanceCriteria: optionalText(input.acceptanceCriteria),
    completionCriteria: optionalText(input.completionCriteria),
    riskNote: optionalText(input.riskNote),
    expectedResult: optionalText(input.expectedResult),
    actualResult: optionalText(input.actualResult),
    reproduceSteps: optionalText(input.reproduceSteps),
    priority: input.priority ?? 'P2',
    sourceType: 'manual',
  };
}

export function getInitialWorkItemStatus(input: Pick<CreateWorkItemDto, 'assigneeId' | 'teamId' | 'ownerId'>): WorkItemStatus {
  return optionalText(input.assigneeId) || optionalText(input.teamId) ? 'ready_for_dev' : 'unassigned';
}

export function assertNoImmutableWorkItemFields(input: UpdateWorkItemDto): void {
  const field = immutableFields.find((name) => Object.prototype.hasOwnProperty.call(input, name));
  if (field) {
    throw new AppError('VALIDATION_ERROR', `${field} cannot be updated`, 400, { field });
  }
}
