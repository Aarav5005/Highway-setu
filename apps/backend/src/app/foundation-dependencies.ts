import { requireAuth } from '../middleware/require-auth';
import { validateRequest } from '../middleware/validate-request';

export const foundationDependencies = {
  requireAuth,
  validateRequest,
};
