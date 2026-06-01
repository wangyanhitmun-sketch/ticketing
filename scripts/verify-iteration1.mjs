import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const requiredFiles = [
  'apps/api/src/issues/issue-policy.ts',
  'apps/api/src/issues/issue-policy.test.ts',
  'apps/api/src/issues/issue-repository.ts',
  'apps/api/src/issues/issue-repository.test.ts',
  'apps/api/src/issues/issue-service.ts',
  'apps/api/src/issues/issue-service.test.ts',
  'apps/api/src/issues/issue-routes.ts',
  'apps/api/src/issues/issue-routes.test.ts',
  'apps/api/src/shared/errors.ts',
  'apps/web/src/api/issues.ts',
  'apps/web/src/issues/IssuePage.tsx',
  'tests/e2e/iteration-1-issue-smoke.spec.md',
  'development/iteration-1-issue-module-plan.md',
];

for (const file of requiredFiles) {
  assert.equal(existsSync(file), true, `${file} should exist`);
}

const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
assert.equal(packageJson.scripts['test:iteration1'], 'npm run test -w apps/api -- --test-name-pattern "Issue|issue|/issues|createIssue|updateIssue|listIssues|getIssue|closeIssue|validateCreateIssueInput|validateCloseIssueInput"');
assert.equal(packageJson.scripts['verify:iteration1'], 'node scripts/verify-iteration1.mjs');

const app = readFileSync('apps/api/src/app.ts', 'utf8');
assert.match(app, /registerIssueRoutes\(app\)/);

const routes = readFileSync('apps/api/src/issues/issue-routes.ts', 'utf8');
for (const route of ["'/issues'", "'/issues/:issueId'", "'/issues/:issueId/close'"]) {
  assert.match(routes, new RegExp(route.replaceAll('/', '\\/')));
}

const issuePage = readFileSync('apps/web/src/issues/IssuePage.tsx', 'utf8');
assert.match(issuePage, /新建问题单/);
assert.match(issuePage, /问题单收集与关闭/);

console.log('Iteration 1 verification passed');
