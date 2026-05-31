import { readFileSync } from 'node:fs';
import { Client } from 'pg';

const commands = new Set(['migrate', 'seed', 'reset']);
const command = process.argv[2];
const dryRun = process.argv.includes('--dry-run');

const migrationFile = 'db/migrations/0001_p0_schema.sql';
const seedFile = 'db/seeds/0001_base_seed.sql';

function usage() {
  console.error('Usage: node scripts/db.mjs <migrate|seed|reset> [--dry-run]');
  process.exit(1);
}

function readSql(path) {
  const sql = readFileSync(path, 'utf8');
  if (!sql.trim()) {
    throw new Error(`${path} is empty`);
  }
  return sql;
}

async function runSql(sql) {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is required unless --dry-run is used');
  }

  const client = new Client({ connectionString });
  await client.connect();
  try {
    await client.query(sql);
  } finally {
    await client.end();
  }
}

async function migrate() {
  const sql = readSql(migrationFile);
  if (dryRun) {
    console.log(`migration dry-run ok: ${migrationFile} (${sql.length} bytes)`);
    return;
  }
  await runSql(sql);
  console.log('migration applied');
}

async function seed() {
  const sql = readSql(seedFile);
  if (dryRun) {
    console.log(`seed dry-run ok: ${seedFile} (${sql.length} bytes)`);
    return;
  }
  await runSql(sql);
  console.log('seed applied');
}

async function reset() {
  const migrationSql = readSql(migrationFile);
  const seedSql = readSql(seedFile);
  const resetSql = 'DROP SCHEMA public CASCADE; CREATE SCHEMA public; CREATE EXTENSION IF NOT EXISTS "pgcrypto";';
  if (dryRun) {
    console.log(`reset dry-run ok: ${migrationFile} + ${seedFile} (${migrationSql.length + seedSql.length} bytes)`);
    return;
  }
  await runSql(`${resetSql}\n${migrationSql}\n${seedSql}`);
  console.log('database reset complete');
}

if (!commands.has(command)) {
  usage();
}

try {
  if (command === 'migrate') await migrate();
  if (command === 'seed') await seed();
  if (command === 'reset') await reset();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
