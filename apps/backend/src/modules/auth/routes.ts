import { Router } from 'express';
import { requireAuth } from '../../middleware/require-auth';
import {
  validateLogout,
  validateRefreshToken,
  validateSendOtp,
  validateVerifyOtp,
  validateRoleSelection,
} from './validator';
import { createAuthRepository } from './repository';
import { createAuthService } from './service';
import { createAuthController } from './controller';
import { createAuthSessionStore } from './session-store';

const repository = createAuthRepository();
const sessionStore = createAuthSessionStore();
const service = createAuthService({ repository, sessionStore });
const controller = createAuthController(service);

import { validateRequest } from '../../middleware/validate-request';
import { validateAdminLogin } from './validator';

export const authRouter = Router();

authRouter.post('/send-otp', validateRequest(validateSendOtp), controller.sendOtp);
authRouter.post('/verify-otp', validateRequest(validateVerifyOtp), controller.verifyOtp);
authRouter.post('/refresh', validateRequest(validateRefreshToken), controller.refresh);
authRouter.post('/logout', requireAuth(), validateRequest(validateLogout), controller.logout);
authRouter.get('/me', requireAuth(), controller.me);
authRouter.post('/admin-login', validateRequest(validateAdminLogin), controller.adminLogin);
authRouter.post(
  '/role',
  requireAuth(),
  validateRequest(validateRoleSelection),
  controller.selectRole
);
