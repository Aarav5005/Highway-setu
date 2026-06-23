import { Router } from 'express';
import { requireAuth } from '../../middleware/require-auth';
import { validateRequest } from '../../middleware/validate-request';
import * as validator from './validator';
import * as controller from './controller';

const router = Router();

router.post(
  '/',
  requireAuth(['driver']),
  validateRequest(validator.createOrderSchema),
  controller.createOrder
);

router.get('/my-orders', requireAuth(['driver']), controller.getDriverOrders);

router.get(
  '/dhaba-orders',
  requireAuth(['dhaba_owner']),
  validateRequest(validator.dhabaOrdersQuerySchema),
  controller.getDhabaOrders
);

router.get('/:id', requireAuth(), validateRequest(validator.getOrderSchema), controller.getOrder);

router.post(
  '/:id/accept',
  requireAuth(['dhaba_owner']),
  validateRequest(validator.acceptOrderSchema),
  controller.acceptOrder
);

router.post(
  '/:id/reject',
  requireAuth(['dhaba_owner']),
  validateRequest(validator.rejectOrderSchema),
  controller.rejectOrder
);

router.patch(
  '/:id/status',
  requireAuth(['dhaba_owner']),
  validateRequest(validator.updateStatusSchema),
  controller.updateStatus
);

export { router as ordersRouter };
