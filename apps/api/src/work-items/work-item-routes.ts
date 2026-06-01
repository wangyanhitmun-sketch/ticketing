import type { Request, Response, Router } from 'express';
import type { InMemoryIssueRepository } from '../issues/issue-repository.js';
import { fail, ok } from '../shared/api-response.js';
import { AppError } from '../shared/errors.js';
import { createAnonymousRequestContext } from '../shared/request-context.js';
import type { InMemoryIssueWorkItemSourceRepository } from '../sources/source-repository.js';
import { InMemoryWorkItemRepository } from './work-item-repository.js';
import { WorkItemApplicationService } from './work-item-service.js';
import type { WorkItemQuery } from './work-item-types.js';

export interface WorkItemRouteDependencies {
  workItemRepository?: InMemoryWorkItemRepository;
  sourceRepository?: InMemoryIssueWorkItemSourceRepository;
  issueRepository?: InMemoryIssueRepository;
}

export function registerWorkItemRoutes(router: Router, dependencies: WorkItemRouteDependencies = {}): void {
  const repository = dependencies.workItemRepository ?? new InMemoryWorkItemRepository();
  const service = new WorkItemApplicationService(repository, {
    sourceRepository: dependencies.sourceRepository,
    issueRepository: dependencies.issueRepository,
  });

  router.post('/work-items', (req, res) => {
    handle(res, () => {
      const workItem = service.createWorkItem(req.body, createAnonymousRequestContext());
      res.status(201).json(ok(workItem));
    });
  });

  router.get('/work-items', (req, res) => {
    handle(res, () => {
      res.json(ok(service.listWorkItems(parseWorkItemQuery(req.query))));
    });
  });

  router.get('/work-items/:workItemId', (req, res) => {
    handle(res, () => {
      res.json(ok(service.getWorkItem(req.params.workItemId)));
    });
  });

  router.put('/work-items/:workItemId', (req, res) => {
    handle(res, () => {
      res.json(ok(service.updateWorkItem(req.params.workItemId, req.body, createAnonymousRequestContext())));
    });
  });
}

function handle(res: Response, handler: () => void): void {
  try {
    handler();
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.status).json(fail(error.code, error.message, error.details));
      return;
    }
    res.status(500).json(fail('INTERNAL_ERROR', 'Internal server error'));
  }
}

function parseWorkItemQuery(query: Request['query']): WorkItemQuery {
  return {
    keyword: readString(query.keyword),
    type: readString(query.type) as WorkItemQuery['type'],
    status: readString(query.status) as WorkItemQuery['status'],
    sourceType: readString(query.sourceType) as WorkItemQuery['sourceType'],
    priority: readString(query.priority) as WorkItemQuery['priority'],
    ownerId: readString(query.ownerId),
    assigneeId: readString(query.assigneeId),
    teamId: readString(query.teamId),
    isLeaf: readBoolean(query.isLeaf),
    createdFrom: readString(query.createdFrom),
    createdTo: readString(query.createdTo),
    page: readNumber(query.page),
    pageSize: readNumber(query.pageSize),
  };
}

function readString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function readNumber(value: unknown): number | undefined {
  const raw = readString(value);
  if (!raw) {
    return undefined;
  }
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function readBoolean(value: unknown): boolean | undefined {
  const raw = readString(value);
  if (raw === undefined) {
    return undefined;
  }
  return raw === 'true' ? true : raw === 'false' ? false : undefined;
}
