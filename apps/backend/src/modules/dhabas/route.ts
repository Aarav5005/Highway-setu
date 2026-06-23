import { Router } from 'express';
import { requireAuth } from '../../middleware/require-auth';
import { validateRequest } from '../../middleware/validate-request';
import * as controller from './controller';
import * as validator from './validator';

export const dhabasRouter = Router();

dhabasRouter.post(
  '/register',
  requireAuth(),
  validateRequest(validator.registerDhabaSchema),
  controller.register
);

dhabasRouter.get('/:id', validateRequest(validator.getDhabaSchema), controller.getProfile);

dhabasRouter.put(
  '/:id',
  requireAuth(),
  validateRequest(validator.updateDhabaSchema),
  controller.updateProfile
);

dhabasRouter.patch(
  '/:id/toggle-open',
  requireAuth(),
  validateRequest(validator.toggleOpenSchema),
  controller.toggleOpen
);

dhabasRouter.get('/:id/menu', validateRequest(validator.getDhabaSchema), controller.getMenu);
