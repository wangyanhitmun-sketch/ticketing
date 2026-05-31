import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const content = readFileSync(new URL('../openapi.yaml', import.meta.url), 'utf8');

assert.match(content, /^openapi:\s*3\.0\.3/m);
assert.match(content, /title:\s*工单系统 P0 API/);

console.log('openapi.yaml basic validation passed');
