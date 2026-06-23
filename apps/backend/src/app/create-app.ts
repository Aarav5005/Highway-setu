import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import { env } from '../config/env';
import { foundationDependencies } from './foundation-dependencies';
import { errorHandler } from '../middleware/error-handler';
import { notFoundHandler } from '../middleware/not-found-handler';
import { requestContext } from '../middleware/request-context';
import { logger } from '../utils/logger';
import { authRouter } from '../modules/auth';
import { driverProfileRouter } from '../modules/drivers';
import { locationRouter } from '../modules/location';
import { usersRouter } from '../modules/users';
import { mediaRouter } from '../modules/media';
import { adminRouter } from '../modules/admin';
import { dhabasRouter } from '../modules/dhabas/route';
import { menuRouter } from '../modules/menu/route';
import { mechanicsRouter } from '../modules/mechanics/route';
import { tripsRouter } from '../modules/trips/route';
import { ordersRouter } from '../modules/orders/route';
import { mechanicRequestsRouter } from '../modules/mechanic-requests/route';
import { sosRouter } from '../modules/sos/route';
import { loyaltyRouter } from '../modules/loyalty/route';
import { referralsRouter } from '../modules/referrals/route';

export const createApp = () => {
  const app = express();

  app.disable('x-powered-by');

  app.use(
    cors({
      origin: env.CORS_ALLOWED_ORIGINS,
      credentials: true,
    })
  );
  app.use(helmet());
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: false }));
  app.use(
    pinoHttp({
      logger,
      autoLogging: true,
      customProps: (req) => ({ requestId: req.requestId }),
    })
  );
  app.use(requestContext);

  app.locals.foundation = foundationDependencies;
  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1/driver-profile', driverProfileRouter);
  app.use('/api/v1/location', locationRouter);
  app.use('/api/v1/users', usersRouter);
  app.use('/api/v1/media', mediaRouter);
  app.use('/api/v1/admin', adminRouter);
  app.use('/api/v1/dhabas', dhabasRouter);
  app.use('/api/v1/menu', menuRouter);
  app.use('/api/v1/mechanics', mechanicsRouter);
  app.use('/api/v1/trips', tripsRouter);
  app.use('/api/v1/orders', ordersRouter);
  app.use('/api/v1/mechanic-requests', mechanicRequestsRouter);
  app.use('/api/v1/sos', sosRouter);
  app.use('/api/v1/loyalty', loyaltyRouter);
  app.use('/api/v1/referrals', referralsRouter);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
