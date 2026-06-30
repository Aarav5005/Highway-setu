/* global Express */
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
    const profile = await service.getMechanic(req.params.userId as string);
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
    if (req.auth?.role !== 'mechanic' || req.auth?.userId !== (req.params.userId as string)) {
      throw new AppError({
        statusCode: 403,
        code: 'FORBIDDEN',
        message: 'You can only update your own mechanic profile',
      });
    }
    const profile = await service.updateMechanic(req.params.userId as string, req.body);
    res.json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
};

export const uploadPhotos = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.auth?.userId !== req.params.userId) {
      throw new AppError({
        statusCode: 403,
        code: 'FORBIDDEN',
        message: 'You can only update your own mechanic profile',
      });
    }
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      throw new AppError({
        statusCode: 400,
        code: 'BAD_REQUEST',
        message: 'No photos provided',
      });
    }
    const profile = await service.addPhotos(req.params.userId as string, files);
    res.json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
};

export const deletePhoto = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.auth?.userId !== (req.params.userId as string)) {
      throw new AppError({
        statusCode: 403,
        code: 'FORBIDDEN',
        message: 'You can only update your own mechanic profile',
      });
    }
    const { photo_url } = req.body;
    if (!photo_url) {
      throw new AppError({
        statusCode: 400,
        code: 'BAD_REQUEST',
        message: 'photo_url is required',
      });
    }
    const profile = await service.deletePhoto(req.params.userId as string, photo_url);
    res.json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
};
