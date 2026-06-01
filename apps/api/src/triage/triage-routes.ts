import type { Response, Router } from 'express';
import type { InMemoryIssueRepository } from '../issues/issue-repository.js';
import { fail, ok } from '../shared/api-response.js';
import { AppError } from '../shared/errors.js';
import { createAnonymousRequestContext } from '../shared/request-context.js';
import type { InMemoryIssueWorkItemSourceRepository } from '../sources/source-repository.js';
import type { InMemoryWorkItemRepository } from '../work-items/work-item-repository.js';
import { TriageApplicationService } from './triage-service.js';

export interface TriageRouteDependencies {
  issueRepository: InMemoryIssueRepository;
  workItemRepository: InMemoryWorkItemRepository;
  sourceRepository: InMemoryIssueWorkItemSourceRepository;
}

export function registerTriageRoutes(router: Router, dependencies: TriageRouteDependencies): void {
  const service = new TriageApplicationService(dependencies.issueRepository, dependencies.workItemRepository, dependencies.sourceRepository);

  router.post('/issues/:issueId/triage/business-requirement', (req, res) => {
    handle(res, () => {
      res.json(ok(service.triageToBusinessRequirement(req.params.issueId, req.body, createAnonymousRequestContext())));
    });
  });

  router.post('/issues/:issueId/triage/technical-requirement', (req, res) => {
    handle(res, () => {
      res.json(ok(service.triageToTechnicalRequirement(req.params.issueId, req.body, createAnonymousRequestContext())));
    });
  });

  router.post('/issues/:issueId/triage/defect', (req, res) => {
    handle(res, () => {
      res.json(ok(service.triageToDefect(req.params.issueId, req.body, createAnonymousRequestContext())));
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
