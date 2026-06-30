import { Router } from 'express';
import { requireAuth } from '../../middleware/require-auth';
import { validateRequest } from '../../middleware/validate-request';
import * as controller from './controller';
import * as validator from './validator';
import { upload } from '../../middleware/upload';

export const dhabasRouter = Router();

dhabasRouter.post(
  '/register',
  requireAuth(),
  validateRequest(validator.registerDhabaSchema),
  controller.register
);

dhabasRouter.get('/:userId', validateRequest(validator.getDhabaSchema), controller.getProfile);

dhabasRouter.put(
  '/:userId',
  requireAuth(),
  validateRequest(validator.updateDhabaSchema),
  controller.updateProfile
);

dhabasRouter.patch(
  '/:userId/toggle-open',
  requireAuth(),
  validateRequest(validator.toggleOpenSchema),
  controller.toggleOpen
);

dhabasRouter.get('/:userId/menu', validateRequest(validator.getDhabaSchema), controller.getMenu);

dhabasRouter.post(
  '/:userId/photos',
  requireAuth(['dhaba_owner']),
  upload.array('photos', 5),
  controller.uploadPhotos
);

dhabasRouter.delete('/:userId/photos', requireAuth(['dhaba_owner']), controller.deletePhoto);
