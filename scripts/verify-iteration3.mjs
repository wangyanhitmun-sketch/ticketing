import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const requiredFiles = [
  'apps/api/src/sources/source-repository.ts',
  'apps/api/src/sources/source-repository.test.ts',
  'apps/api/src/triage/triage-types.ts',
  'apps/api/src/triage/triage-service.ts',
  'apps/api/src/triage/triage-service.test.ts',
  'apps/api/src/triage/triage-routes.ts',
  'apps/api/src/triage/triage-routes.test.ts',
  'apps/api/src/issues/issue-service.ts',
  'apps/api/src/work-items/work-item-service.ts',
  'apps/web/src/api/issues.ts',
  'apps/web/src/issues/IssuePage.tsx',
  'packages/contracts/openapi.yaml',
  'tests/e2e/iteration-3-triage-smoke.spec.md',
  'development/iteration-3-triage-source-plan.md',
];

for (const file of requiredFiles) {
  assert.equal(existsSync(file), true, `${file} should exist`);
}

const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
assert.equal(packageJson.scripts['test:iteration3'], 'npm run test -w apps/api -- --test-name-pattern "Triage|triage|source relation|related work item|source issue|converted work item"');
assert.equal(packageJson.scripts['verify:iteration3'], 'node scripts/verify-iteration3.mjs');

const app = readFileSync('apps/api/src/app.ts', 'utf8');
assert.match(app, /registerTriageRoutes\(app,/);
assert.match(app, /InMemoryIssueWorkItemSourceRepository/);

const routes = readFileSync('apps/api/src/triage/triage-routes.ts', 'utf8');
for (const route of [
  "'/issues/:issueId/triage/business-requirement'",
  "'/issues/:issueId/triage/technical-requirement'",
  "'/issues/:issueId/triage/defect'",
]) {
  assert.match(routes, new RegExp(route.replaceAll('/', '\\/')));
}

const service = readFileSync('apps/api/src/triage/triage-service.ts', 'utf8');
assert.match(service, /sourceType: 'issue_converted'/);
assert.match(service, /relationType: 'converted'/);
assert.match(service, /updateStatus\(issueId, 'converted'\)/);
assert.match(service, /triageToBusinessRequirement/);
assert.match(service, /triageToTechnicalRequirement/);
assert.match(service, /triageToDefect/);

const issueService = readFileSync('apps/api/src/issues/issue-service.ts', 'utf8');
assert.match(issueService, /relatedWorkItems/);

const workItemService = readFileSync('apps/api/src/work-items/work-item-service.ts', 'utf8');
assert.match(workItemService, /sourceIssues/);

const openapi = readFileSync('packages/contracts/openapi.yaml', 'utf8');
assert.match(openapi, /\/issues\/\{issueId\}\/triage\/business-requirement:/);
assert.match(openapi, /\/issues\/\{issueId\}\/triage\/technical-requirement:/);
assert.match(openapi, /\/issues\/\{issueId\}\/triage\/defect:/);
assert.match(openapi, /TriageWorkItemRequest:/);
assert.match(openapi, /TriageResult:/);

const issueApi = readFileSync('apps/web/src/api/issues.ts', 'utf8');
assert.match(issueApi, /triageIssueToBusinessRequirement/);
assert.match(issueApi, /triageIssueToTechnicalRequirement/);
assert.match(issueApi, /triageIssueToDefect/);

const page = readFileSync('apps/web/src/issues/IssuePage.tsx', 'utf8');
assert.match(page, /转业务需求/);
assert.match(page, /转技术需求/);
assert.match(page, /转缺陷/);

console.log('Iteration 3 verification passed');
