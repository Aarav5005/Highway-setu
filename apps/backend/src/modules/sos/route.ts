import { Router } from 'express';
import { requireAuth } from '../../middleware/require-auth';
import { validateRequest } from '../../middleware/validate-request';
import * as validator from './validator';
import * as controller from './controller';

const router = Router();

// NO rate limiting requested by user, so skipping rate limit middleware
router.post(
  '/trigger',
  requireAuth(['driver']),
  validateRequest(validator.triggerSosSchema),
  controller.triggerSos
);

router.post(
  '/:id/resolve',
  requireAuth(['driver']),
  validateRequest(validator.resolveSosSchema),
  controller.resolveSos
);

router.get('/active', requireAuth(['driver']), controller.getActiveSos);

export { router as sosRouter };
