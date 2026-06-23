import { Router } from 'express';
import { requireAuth } from '../../middleware/require-auth';
import * as controller from './controller';

const router = Router();

router.get('/my-points', requireAuth(['driver']), controller.getMyPoints);

export { router as loyaltyRouter };
