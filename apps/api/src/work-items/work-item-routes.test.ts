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
    { body: body ?? {}, params: { workItemId: 'work-item-1' }, query: {} },
    response,
    () => undefined,
  );
  return { status: response.statusCode, body: response.body as { success: boolean; data: any; error: any } };
}

function resetApp() {
  app = createApp();
}

test('POST /work-items returns created business requirement envelope', async () => {
  resetApp();
  const response = await request('POST', '/work-items', { type: 'business_requirement', title: '审批优化', description: '优化审批链路' });

  assert.equal(response.status, 201);
  assert.equal(response.body.data.type, 'business_requirement');
  assert.equal(response.body.data.sourceType, 'manual');
});

test('POST /work-items returns created technical requirement envelope', async () => {
  resetApp();
  const response = await request('POST', '/work-items', { type: 'technical_requirement', title: '缓存改造', description: '提升查询性能' });

  assert.equal(response.status, 201);
  assert.equal(response.body.data.type, 'technical_requirement');
});

test('POST /work-items returns created defect envelope', async () => {
  resetApp();
  const response = await request('POST', '/work-items', { type: 'defect', title: '审批失败', description: '提交时报错' });

  assert.equal(response.status, 201);
  assert.equal(response.body.data.type, 'defect');
});

test('POST /work-items returns validation error for blank title', async () => {
  resetApp();
  const response = await request('POST', '/work-items', { type: 'defect', title: ' ', description: '提交时报错' });

  assert.equal(response.status, 400);
  assert.equal(response.body.error.code, 'VALIDATION_ERROR');
});

test('GET /work-items returns paged work items envelope', async () => {
  resetApp();
  const response = await request('GET', '/work-items');

  assert.equal(response.status, 200);
  assert.equal(Array.isArray(response.body.data.items), true);
  assert.equal(typeof response.body.data.total, 'number');
});

test('GET /work-items/:workItemId returns detail envelope', async () => {
  resetApp();
  await request('POST', '/work-items', { type: 'business_requirement', title: '审批优化', description: '优化审批链路' });

  const response = await request('GET', '/work-items/:workItemId');

  assert.equal(response.status, 200);
  assert.equal(response.body.data.id, 'work-item-1');
  assert.equal(Array.isArray(response.body.data.statusLogs), true);
});

test('PUT /work-items/:workItemId returns updated detail envelope', async () => {
  resetApp();
  await request('POST', '/work-items', { type: 'business_requirement', title: '审批优化', description: '优化审批链路' });

  const response = await request('PUT', '/work-items/:workItemId', { title: '审批体验优化' });

  assert.equal(response.status, 200);
  assert.equal(response.body.data.title, '审批体验优化');
});

test('PUT /work-items/:workItemId returns validation error for immutable type change', async () => {
  resetApp();
  await request('POST', '/work-items', { type: 'business_requirement', title: '审批优化', description: '优化审批链路' });

  const response = await request('PUT', '/work-items/:workItemId', { type: 'defect' });

  assert.equal(response.status, 400);
  assert.equal(response.body.error.code, 'VALIDATION_ERROR');
});
