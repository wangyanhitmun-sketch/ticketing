import cors from 'cors';
import express from 'express';
import { registerHealthRoutes } from './api/health.js';
import { registerIssueRoutes } from './issues/issue-routes.js';
import { registerWorkItemRoutes } from './work-items/work-item-routes.js';

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  registerHealthRoutes(app);
  registerIssueRoutes(app);
  registerWorkItemRoutes(app);

  return app;
}
