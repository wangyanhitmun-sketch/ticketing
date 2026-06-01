import type { NextFunction, Request, Response, Router } from 'express';
import { ok, fail } from '../shared/api-response.js';
import { AppError } from '../shared/errors.js';
import { createAnonymousRequestContext } from '../shared/request-context.js';
import { InMemoryIssueRepository } from './issue-repository.js';
import { IssueApplicationService } from './issue-service.js';
import type { IssueQuery } from './issue-types.js';

export function registerIssueRoutes(router: Router): void {
  const repository = new InMemoryIssueRepository();
  const service = new IssueApplicationService(repository);

  router.post('/issues', (req, res) => {
    handle(res, () => {
      const issue = service.createIssue(req.body, createAnonymousRequestContext());
      res.status(201).json(ok(issue));
    });
  });

  router.get('/issues', (req, res) => {
    handle(res, () => {
      res.json(ok(service.listIssues(parseIssueQuery(req.query))));
    });
  });

  router.get('/issues/:issueId', (req, res) => {
    handle(res, () => {
      res.json(ok(service.getIssue(req.params.issueId)));
    });
  });

  router.put('/issues/:issueId', (req, res) => {
    handle(res, () => {
      res.json(ok(service.updateIssue(req.params.issueId, req.body, createAnonymousRequestContext())));
    });
  });

  router.post('/issues/:issueId/close', (req, res) => {
    handle(res, () => {
      res.json(ok(service.closeIssue(req.params.issueId, req.body, createAnonymousRequestContext())));
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

function parseIssueQuery(query: Request['query']): IssueQuery {
  return {
    keyword: readString(query.keyword),
    status: readString(query.status) as IssueQuery['status'],
    clueType: readString(query.clueType) as IssueQuery['clueType'],
    priority: readString(query.priority) as IssueQuery['priority'],
    submitterId: readString(query.submitterId),
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
