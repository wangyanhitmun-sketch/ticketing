import type { IssueStatus } from '@ticketing/domain/domain-types';
import { AppError } from '../shared/errors.js';
import type {
  CloseIssueDto,
  CreateIssueDto,
  NormalizedCloseIssueInput,
  NormalizedCreateIssueInput,
} from './issue-types.js';

function requiredText(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new AppError('VALIDATION_ERROR', `${field} is required`, 400, { field });
  }
  return value.trim();
}

function optionalText(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export function validateCreateIssueInput(input: CreateIssueDto): NormalizedCreateIssueInput {
  return {
    ...input,
    title: requiredText(input.title, 'title'),
    description: requiredText(input.description, 'description'),
    category: optionalText(input.category),
    sourceChannel: optionalText(input.sourceChannel) ?? 'manual',
    impactScope: optionalText(input.impactScope),
    expectedResult: optionalText(input.expectedResult),
    actualResult: optionalText(input.actualResult),
    reproduceSteps: optionalText(input.reproduceSteps),
    clueType: input.clueType ?? 'unknown',
    priority: input.priority ?? 'P2',
  };
}

export function assertIssueEditable(status: IssueStatus): void {
  if (status === 'closed') {
    throw new AppError('ISSUE_STATUS_INVALID', 'Closed issue cannot be edited', 409);
  }
}

export function assertIssueClosable(status: IssueStatus): void {
  if (status !== 'pending_triage') {
    throw new AppError('ISSUE_STATUS_INVALID', 'Only pending triage issue can be closed', 409);
  }
}

export function validateCloseIssueInput(input: CloseIssueDto): NormalizedCloseIssueInput {
  const closeReasonType = optionalText(input.closeReasonType);
  const closeReason = optionalText(input.closeReason);
  if (!closeReasonType && !closeReason) {
    throw new AppError('VALIDATION_ERROR', 'close reason is required', 400);
  }
  return { closeReasonType, closeReason };
}
