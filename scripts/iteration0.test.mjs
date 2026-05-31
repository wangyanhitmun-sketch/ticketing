import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { test } from 'node:test';
import { execFileSync } from 'node:child_process';

const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'));

test('root scripts expose runnable Iteration 0 database and dev commands', () => {
  const pkg = readJson('package.json');

  assert.equal(pkg.scripts['dev:api'], 'npm run dev -w apps/api');
  assert.equal(pkg.scripts['dev:web'], 'npm run dev -w apps/web');
  assert.equal(pkg.scripts['db:migrate'], 'node scripts/db.mjs migrate');
  assert.equal(pkg.scripts['db:seed'], 'node scripts/db.mjs seed');
  assert.equal(pkg.scripts['db:reset'], 'node scripts/db.mjs reset');
  assert.equal(pkg.scripts['verify:iteration0'], 'node scripts/verify-iteration0.mjs');
});

test('database migration and seed files exist', () => {
  assert.equal(existsSync('db/migrations/0001_p0_schema.sql'), true);
  assert.equal(existsSync('db/seeds/0001_base_seed.sql'), true);

  const seed = readFileSync('db/seeds/0001_base_seed.sql', 'utf8');
  assert.match(seed, /team_a/);
  assert.match(seed, /user_admin/);
});

test('database commands support dry-run verification', () => {
  const migrate = execFileSync('node', ['scripts/db.mjs', 'migrate', '--dry-run'], { encoding: 'utf8' });
  const seed = execFileSync('node', ['scripts/db.mjs', 'seed', '--dry-run'], { encoding: 'utf8' });
  const reset = execFileSync('node', ['scripts/db.mjs', 'reset', '--dry-run'], { encoding: 'utf8' });

  assert.match(migrate, /migration dry-run ok/);
  assert.match(seed, /seed dry-run ok/);
  assert.match(reset, /reset dry-run ok/);
});

test('Iteration 0 verifier passes', () => {
  const output = execFileSync('node', ['scripts/verify-iteration0.mjs'], { encoding: 'utf8' });

  assert.match(output, /Iteration 0 verification passed/);
});
