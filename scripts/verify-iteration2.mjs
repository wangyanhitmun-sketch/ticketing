import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const requiredFiles = [
  'apps/api/src/work-items/work-item-policy.ts',
  'apps/api/src/work-items/work-item-policy.test.ts',
  'apps/api/src/work-items/work-item-repository.ts',
  'apps/api/src/work-items/work-item-repository.test.ts',
  'apps/api/src/work-items/work-item-service.ts',
  'apps/api/src/work-items/work-item-service.test.ts',
  'apps/api/src/work-items/work-item-routes.ts',
  'apps/api/src/work-items/work-item-routes.test.ts',
  'apps/web/src/api/work-items.ts',
  'apps/web/src/work-items/WorkItemPage.tsx',
  'tests/e2e/iteration-2-work-item-smoke.spec.md',
  'development/iteration-2-work-item-module-plan.md',
];

for (const file of requiredFiles) {
  assert.equal(existsSync(file), true, `${file} should exist`);
}

const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
assert.equal(packageJson.scripts['test:iteration2'], 'npm run test -w apps/api -- --test-name-pattern "WorkItem|work item|/work-items|createWorkItem|updateWorkItem|listWorkItems|getWorkItem|validateCreateWorkItemInput|getInitialWorkItemStatus"');
assert.equal(packageJson.scripts['verify:iteration2'], 'node scripts/verify-iteration2.mjs');

const app = readFileSync('apps/api/src/app.ts', 'utf8');
assert.match(app, /registerWorkItemRoutes\(app\)/);

const routes = readFileSync('apps/api/src/work-items/work-item-routes.ts', 'utf8');
for (const route of ["'/work-items'", "'/work-items/:workItemId'"]) {
  assert.match(routes, new RegExp(route.replaceAll('/', '\\/')));
}

const page = readFileSync('apps/web/src/work-items/WorkItemPage.tsx', 'utf8');
assert.match(page, /三类工单创建与管理/);
assert.match(page, /新建工单/);

console.log('Iteration 2 verification passed');
