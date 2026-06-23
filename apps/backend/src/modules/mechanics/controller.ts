import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../../errors/app-error';
import * as service from './service';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.auth?.role !== 'mechanic') {
      throw new AppError({
        statusCode: 403,
        code: 'FORBIDDEN',
        message: 'Only mechanics can register a mechanic profile',
      });
    }
    const profile = await service.registerMechanic(req.auth?.userId, req.body);
    res.status(201).json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const profile = await service.getMechanic(req.params.id as string);
    if (!profile) {
      throw new AppError({
        statusCode: 404,
        code: 'FORBIDDEN',
        message: 'Mechanic profile not found',
      });
    }
    res.json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.auth?.role !== 'mechanic' || req.auth?.userId !== (req.params.id as string)) {
      throw new AppError({
        statusCode: 403,
        code: 'FORBIDDEN',
        message: 'You can only update your own mechanic profile',
      });
    }
    const profile = await service.updateMechanic(req.params.id as string, req.body);
    res.json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
};
