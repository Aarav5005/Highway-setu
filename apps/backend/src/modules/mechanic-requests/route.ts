import { Router } from 'express';
import { requireAuth } from '../../middleware/require-auth';
import { validateRequest } from '../../middleware/validate-request';
import * as validator from './validator';
import * as controller from './controller';

const router = Router();

router.post(
  '/',
  requireAuth(['driver']),
  validateRequest(validator.createRequestSchema),
  controller.createRequest
);

router.post(
  '/:id/accept',
  requireAuth(['mechanic']),
  validateRequest(validator.acceptRequestSchema),
  controller.acceptRequest
);

router.post(
  '/:id/complete',
  requireAuth(['mechanic']),
  validateRequest(validator.completeRequestSchema),
  controller.completeRequest
);

router.post(
  '/:id/cancel',
  requireAuth(['driver']),
  validateRequest(validator.cancelRequestSchema),
  controller.cancelRequest
);

router.get('/my-requests', requireAuth(['driver']), controller.getDriverRequests);

router.get('/incoming', requireAuth(['mechanic']), controller.getIncomingRequests);

export { router as mechanicRequestsRouter };
