import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createApp } from '../app.js';

let app: ReturnType<typeof createApp>;

interface MockResponse {
  statusCode: number;
  body: unknown;
  status(code: number): MockResponse;
  json(body: unknown): MockResponse;
}

function createResponse(): MockResponse {
  return {
    statusCode: 200,
    body: undefined,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(body: unknown) {
      this.body = body;
      return this;
    },
  };
}

async function request(method: string, path: string, body?: unknown, params: Record<string, string> = {}) {
  const stack = (app.router as unknown as { stack: Array<any> }).stack;
  const layer = stack.find((item) => item.route?.path === path && item.route.methods[method.toLowerCase()]);
  assert(layer?.route, `route not found: ${method} ${path}`);
  const response = createResponse();
  await layer.route.stack[0].handle(
    { body: body ?? {}, params: { issueId: 'issue-1', workItemId: 'work-item-1', ...params }, query: {} },
    response,
    () => undefined,
  );
  return { status: response.statusCode, body: response.body as { success: boolean; data: any; error: any } };
}

function resetApp() {
  app = createApp();
}

async function createIssue() {
  return request('POST', '/issues', { title: '审批优化', description: '优化审批链路', priority: 'P1' });
}

test('POST /issues/:issueId/triage/business-requirement returns triage result envelope', async () => {
  resetApp();
  await createIssue();

  const response = await request('POST', '/issues/:issueId/triage/business-requirement');

  assert.equal(response.status, 200);
  assert.equal(response.body.data.issueStatus, 'converted');
  assert.equal(response.body.data.workItem.type, 'business_requirement');
  assert.equal(response.body.data.workItem.sourceType, 'issue_converted');
});

test('POST /issues/:issueId/triage/technical-requirement returns triage result envelope', async () => {
  resetApp();
  await createIssue();

  const response = await request('POST', '/issues/:issueId/triage/technical-requirement');

  assert.equal(response.status, 200);
  assert.equal(response.body.data.workItem.type, 'technical_requirement');
});

test('POST /issues/:issueId/triage/defect returns triage result envelope', async () => {
  resetApp();
  await createIssue();

  const response = await request('POST', '/issues/:issueId/triage/defect');

  assert.equal(response.status, 200);
  assert.equal(response.body.data.workItem.type, 'defect');
});

test('POST triage returns status error for already converted issue', async () => {
  resetApp();
  await createIssue();
  await request('POST', '/issues/:issueId/triage/business-requirement');

  const response = await request('POST', '/issues/:issueId/triage/defect');

  assert.equal(response.status, 409);
  assert.equal(response.body.error.code, 'ISSUE_STATUS_INVALID');
});

test('GET /issues/:issueId shows related work item after triage', async () => {
  resetApp();
  await createIssue();
  const triage = await request('POST', '/issues/:issueId/triage/business-requirement');

  const response = await request('GET', '/issues/:issueId');

  assert.equal(response.body.data.relatedWorkItems.length, 1);
  assert.equal(response.body.data.relatedWorkItems[0].id, triage.body.data.workItem.id);
});

test('GET /work-items/:workItemId shows source issue after triage', async () => {
  resetApp();
  await createIssue();
  const triage = await request('POST', '/issues/:issueId/triage/business-requirement');

  const response = await request('GET', '/work-items/:workItemId', undefined, { workItemId: triage.body.data.workItem.id });

  assert.equal(response.body.data.sourceIssues.length, 1);
  assert.equal(response.body.data.sourceIssues[0].id, 'issue-1');
});
