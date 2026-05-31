import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const requiredFiles = [
  'apps/api/src/index.ts',
  'apps/api/src/api/health.ts',
  'apps/api/src/shared/api-response.ts',
  'apps/api/src/shared/request-context.ts',
  'apps/web/index.html',
  'apps/web/src/main.tsx',
  'apps/web/src/api/client.ts',
  'apps/web/src/components/AppState.tsx',
  'packages/contracts/openapi.yaml',
  'packages/domain/src/index.ts',
  'db/migrations/0001_p0_schema.sql',
  'db/seeds/0001_base_seed.sql',
  'tests/e2e/smoke.spec.md',
];

for (const file of requiredFiles) {
  assert.equal(existsSync(file), true, `${file} should exist`);
}

const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
assert.equal(packageJson.scripts['dev:api'], 'npm run dev -w apps/api');
assert.equal(packageJson.scripts['dev:web'], 'npm run dev -w apps/web');
assert.equal(packageJson.scripts['db:migrate'], 'node scripts/db.mjs migrate');
assert.equal(packageJson.scripts['db:seed'], 'node scripts/db.mjs seed');
assert.equal(packageJson.scripts['db:reset'], 'node scripts/db.mjs reset');

execFileSync('node', ['scripts/db.mjs', 'migrate', '--dry-run'], { stdio: 'pipe' });
execFileSync('node', ['scripts/db.mjs', 'seed', '--dry-run'], { stdio: 'pipe' });
execFileSync('node', ['scripts/db.mjs', 'reset', '--dry-run'], { stdio: 'pipe' });

console.log('Iteration 0 verification passed');
