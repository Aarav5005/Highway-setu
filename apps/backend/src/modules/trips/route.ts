import { Router } from 'express';
import { requireAuth } from '../../middleware/require-auth';
import { validateRequest } from '../../middleware/validate-request';
import * as validator from './validator';
import * as controller from './controller';

const router = Router();

router.post(
  '/start',
  requireAuth(['driver']),
  validateRequest(validator.startTripSchema),
  controller.startTrip
);

router.post(
  '/:id/update-location',
  requireAuth(['driver']),
  validateRequest(validator.updateLocationSchema),
  controller.updateLocation
);

router.post(
  '/:id/end',
  requireAuth(['driver']),
  validateRequest(validator.endTripSchema),
  controller.endTrip
);

router.get('/history', requireAuth(['driver']), controller.getHistory);

router.get('/active', requireAuth(['driver']), controller.getActive);

export { router as tripsRouter };
