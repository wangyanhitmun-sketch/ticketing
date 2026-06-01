import cors from 'cors';
import express from 'express';
import { registerHealthRoutes } from './api/health.js';
import { InMemoryIssueRepository } from './issues/issue-repository.js';
import { registerIssueRoutes } from './issues/issue-routes.js';
import { InMemoryIssueWorkItemSourceRepository } from './sources/source-repository.js';
import { registerTriageRoutes } from './triage/triage-routes.js';
import { InMemoryWorkItemRepository } from './work-items/work-item-repository.js';
import { registerWorkItemRoutes } from './work-items/work-item-routes.js';

export function createApp() {
  const app = express();
  const issueRepository = new InMemoryIssueRepository();
  const workItemRepository = new InMemoryWorkItemRepository();
  const sourceRepository = new InMemoryIssueWorkItemSourceRepository();

  app.use(cors());
  app.use(express.json());

  registerHealthRoutes(app);
  registerIssueRoutes(app, { issueRepository, sourceRepository, workItemRepository });
  registerWorkItemRoutes(app, { workItemRepository, sourceRepository, issueRepository });
  registerTriageRoutes(app, { issueRepository, workItemRepository, sourceRepository });

  return app;
}
