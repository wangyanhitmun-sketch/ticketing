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

async function request(method: string, path: string, body?: unknown) {
  const stack = (app.router as unknown as { stack: Array<any> }).stack;
  const layer = stack.find((item) => item.route?.path === path && item.route.methods[method.toLowerCase()]);
  assert(layer?.route, `route not found: ${method} ${path}`);
  const response = createResponse();
  await layer.route.stack[0].handle(
    {
      body: body ?? {},
      params: { issueId: 'issue-1' },
      query: {},
    },
    response,
    () => undefined,
  );
  return {
    status: response.statusCode,
    body: response.body as { success: boolean; data: any; error: any },
  };
}

function resetApp() {
  app = createApp();
}

test('POST /issues returns created issue envelope', async () => {
  resetApp();
  const response = await request('POST', '/issues', { title: '审批失败', description: '点击提交后报错' });

  assert.equal(response.status, 201);
  assert.equal(response.body.success, true);
  assert.equal(response.body.data.status, 'pending_triage');
});

test('POST /issues returns validation error for blank title', async () => {
  resetApp();
  const response = await request('POST', '/issues', { title: ' ', description: '点击提交后报错' });

  assert.equal(response.status, 400);
  assert.equal(response.body.success, false);
  assert.equal(response.body.error.code, 'VALIDATION_ERROR');
});

test('GET /issues returns paged issues envelope', async () => {
  resetApp();
  const response = await request('GET', '/issues');

  assert.equal(response.status, 200);
  assert.equal(response.body.success, true);
  assert.equal(Array.isArray(response.body.data.items), true);
  assert.equal(typeof response.body.data.total, 'number');
});

test('GET /issues/:issueId returns detail envelope', async () => {
  resetApp();
  await request('POST', '/issues', { title: '审批失败', description: '点击提交后报错' });

  const response = await request('GET', '/issues/:issueId');

  assert.equal(response.status, 200);
  assert.equal(response.body.data.id, 'issue-1');
  assert.equal(Array.isArray(response.body.data.statusLogs), true);
});

test('PUT /issues/:issueId returns updated detail envelope', async () => {
  resetApp();
  await request('POST', '/issues', { title: '审批失败', description: '点击提交后报错' });

  const response = await request('PUT', '/issues/:issueId', { title: '审批偶现失败' });

  assert.equal(response.status, 200);
  assert.equal(response.body.data.title, '审批偶现失败');
});

test('POST /issues/:issueId/close returns closed issue envelope', async () => {
  resetApp();
  await request('POST', '/issues', { title: '审批失败', description: '点击提交后报错' });

  const response = await request('POST', '/issues/:issueId/close', { closeReason: '重复反馈' });

  assert.equal(response.status, 200);
  assert.equal(response.body.data.status, 'closed');
});

test('POST /issues/:issueId/close returns validation error for empty reason', async () => {
  resetApp();
  await request('POST', '/issues', { title: '审批失败', description: '点击提交后报错' });

  const response = await request('POST', '/issues/:issueId/close', {});

  assert.equal(response.status, 400);
  assert.equal(response.body.error.code, 'VALIDATION_ERROR');
});
