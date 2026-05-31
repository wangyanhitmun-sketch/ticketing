import type { Router } from 'express';
import { ok } from '../shared/api-response.js';

export interface HealthPayload {
  service: 'ticketing-api';
  status: 'ok';
  timestamp: string;
}

export function createHealthPayload(now = new Date()): HealthPayload {
  return {
    service: 'ticketing-api',
    status: 'ok',
    timestamp: now.toISOString(),
  };
}

export function registerHealthRoutes(router: Router): void {
  router.get('/health', (_req, res) => {
    res.json(ok<HealthPayload>(createHealthPayload()));
  });
}
