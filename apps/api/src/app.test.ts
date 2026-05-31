import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createHealthPayload } from './api/health.js';
import { createApp } from './app.js';

test('createHealthPayload returns ticketing-api ok payload', () => {
  const payload = createHealthPayload(new Date('2026-05-31T12:00:00.000Z'));

  assert.deepEqual(payload, {
    service: 'ticketing-api',
    status: 'ok',
    timestamp: '2026-05-31T12:00:00.000Z',
  });
});

test('createApp constructs an express app with route registration', () => {
  const app = createApp();

  assert.equal(typeof app, 'function');
  assert.equal(typeof app.listen, 'function');
});
