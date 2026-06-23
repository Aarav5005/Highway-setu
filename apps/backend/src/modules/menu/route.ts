import { Router } from 'express';
import { requireAuth } from '../../middleware/require-auth';
import { validateRequest } from '../../middleware/validate-request';
import * as controller from './controller';
import * as validator from './validator';

export const menuRouter = Router();

menuRouter.post('/', requireAuth(), validateRequest(validator.createMenuSchema), controller.create);

menuRouter.put(
  '/:id',
  requireAuth(),
  validateRequest(validator.updateMenuSchema),
  controller.update
);

menuRouter.delete(
  '/:id',
  requireAuth(),
  validateRequest(validator.deleteMenuSchema),
  controller.remove
);
