import { dbPool } from '../pool';
import { runMigrations } from './migration-runner';
import { logger } from '../../utils/logger';

const run = async () => {
  try {
    await runMigrations();
    logger.info('Migrations completed successfully');
    process.exitCode = 0;
  } catch (error) {
    logger.error({ err: error }, 'Migration runner failed');
    process.exitCode = 1;
  } finally {
    await dbPool.end();
  }
};

void run();
