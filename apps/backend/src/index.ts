import { createApp } from './app/create-app';
import { env } from './config/env';
import { logger } from './utils/logger';

const app = createApp();

app.listen(env.APP_PORT, () => {
  logger.info(
    {
      port: env.APP_PORT,
      env: env.APP_ENV,
      baseUrl: env.APP_BASE_URL,
    },
    'Backend foundation started'
  );
});
