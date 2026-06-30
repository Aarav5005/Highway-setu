import type { NextFunction, Request, Response } from 'express';
import type { AuthService } from './service';

export const createAuthController = (service: AuthService) => ({
  sendOtp: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await service.sendOtp(req.body.phoneE164);
      res.status(200).json({
        verificationToken: result.verificationToken,
        expiresInSec: result.expiresInSec,
      });
    } catch (error) {
      next(error);
    }
  },

  verifyOtp: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await service.verifyOtp(req.body);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  refresh: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await service.refreshAccessToken(req.body.refreshToken);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  logout: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await service.logout({
        accessUserId: req.auth?.userId ?? '',
        refreshToken: req.body.refreshToken,
      });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  me: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await service.getAuthContext(req.auth?.userId ?? '');
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  adminLogin: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await service.adminLogin(req.body.email, req.body.password);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  selectRole: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await service.selectRole({
        userId: req.auth?.userId ?? '',
        role: req.body.role,
      });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
});
