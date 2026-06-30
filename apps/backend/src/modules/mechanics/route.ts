import { Router } from 'express';
import { requireAuth } from '../../middleware/require-auth';
import { validateRequest } from '../../middleware/validate-request';
import * as controller from './controller';
import * as validator from './validator';
import { upload } from '../../middleware/upload';

export const mechanicsRouter = Router();

mechanicsRouter.post(
  '/register',
  requireAuth(),
  validateRequest(validator.registerMechanicSchema),
  controller.register
);

mechanicsRouter.get(
  '/:userId',
  validateRequest(validator.getMechanicSchema),
  controller.getProfile
);

mechanicsRouter.put(
  '/:userId',
  requireAuth(),
  validateRequest(validator.updateMechanicSchema),
  controller.updateProfile
);

mechanicsRouter.post(
  '/:userId/photos',
  requireAuth(['mechanic']),
  upload.array('photos', 5),
  controller.uploadPhotos
);

mechanicsRouter.delete('/:userId/photos', requireAuth(['mechanic']), controller.deletePhoto);
