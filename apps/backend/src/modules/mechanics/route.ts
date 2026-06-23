import { Router } from 'express';
import { requireAuth } from '../../middleware/require-auth';
import { validateRequest } from '../../middleware/validate-request';
import * as controller from './controller';
import * as validator from './validator';

export const mechanicsRouter = Router();

mechanicsRouter.post(
  '/register',
  requireAuth(),
  validateRequest(validator.registerMechanicSchema),
  controller.register
);

mechanicsRouter.get('/:id', validateRequest(validator.getMechanicSchema), controller.getProfile);

mechanicsRouter.put(
  '/:id',
  requireAuth(),
  validateRequest(validator.updateMechanicSchema),
  controller.updateProfile
);
