import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import type { PoolClient } from 'pg';
import { dbPool } from '../pool';
import { logger } from '../../utils/logger';

const getMigrationsDir = () => join(process.cwd(), '..', '..', 'infra', 'database', 'migrations');

const ensureMigrationTable = async (client: PoolClient) => {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);
};

const listAppliedVersions = async (client: PoolClient) => {
  const result = await client.query<{ version: string }>('SELECT version FROM schema_migrations');
  return new Set(result.rows.map((row) => row.version));
};

export const runMigrations = async () => {
  const client = await dbPool.connect();

  try {
    await client.query('BEGIN');
    await ensureMigrationTable(client);

    const migrationsDir = getMigrationsDir();
    const files = (await readdir(migrationsDir)).filter((file) => file.endsWith('.sql')).sort();

    const applied = await listAppliedVersions(client);

    for (const file of files) {
      if (applied.has(file)) {
        continue;
      }

      const sql = await readFile(join(migrationsDir, file), 'utf8');
      logger.info({ migration: file }, 'Applying migration');
      await client.query(sql);
      await client.query('INSERT INTO schema_migrations(version) VALUES($1)', [file]);
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};
