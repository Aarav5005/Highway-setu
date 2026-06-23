import { Router } from 'express';
import { requireAuth } from '../../middleware/require-auth';
import * as controller from './controller';

const router = Router();

router.get(
  '/my-code',
  requireAuth(['driver', 'dhaba_owner', 'mechanic', 'admin']),
  controller.getMyCode
);

router.get(
  '/my-referrals',
  requireAuth(['driver', 'dhaba_owner', 'mechanic', 'admin']),
  controller.getMyReferrals
);

export { router as referralsRouter };
