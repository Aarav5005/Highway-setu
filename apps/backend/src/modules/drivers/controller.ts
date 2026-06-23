import type { NextFunction, Request, Response } from 'express';
import type { DriverProfileService } from './service';

export const createDriverProfileController = (service: DriverProfileService) => ({
  getMe: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await service.getDriverProfile(req.auth?.userId ?? '');
      res.status(200).json(result.profile);
    } catch (error) {
      next(error);
    }
  },

  updateMe: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await service.upsertDriverProfile(req.auth?.userId ?? '', req.body);
      res.status(200).json(result.profile);
    } catch (error) {
      next(error);
    }
  },

  updateTruck: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await service.updateDriverTruck(req.auth?.userId ?? '', req.body);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
});
