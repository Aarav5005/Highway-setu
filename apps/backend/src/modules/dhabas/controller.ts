import type { Request, Response, NextFunction } from 'express';
/* global Express */
import { AppError } from '../../errors/app-error';
import * as service from './service';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.auth?.role !== 'dhaba_owner') {
      throw new AppError({
        statusCode: 403,
        code: 'FORBIDDEN',
        message: 'Only dhaba owners can register a dhaba profile',
      });
    }
    const profile = await service.registerDhaba(req.auth?.userId, req.body);
    res.status(201).json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const profile = await service.getDhaba(req.params.userId as string);
    if (!profile) {
      throw new AppError({
        statusCode: 404,
        code: 'FORBIDDEN',
        message: 'Dhaba profile not found',
      });
    }
    res.json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.auth?.role !== 'dhaba_owner' || req.auth?.userId !== (req.params.userId as string)) {
      throw new AppError({
        statusCode: 403,
        code: 'FORBIDDEN',
        message: 'You can only update your own dhaba profile',
      });
    }
    const profile = await service.updateDhaba(req.params.userId as string, req.body);
    res.json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
};

export const toggleOpen = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.auth?.role !== 'dhaba_owner' || req.auth?.userId !== (req.params.userId as string)) {
      throw new AppError({
        statusCode: 403,
        code: 'FORBIDDEN',
        message: 'You can only update your own dhaba profile',
      });
    }
    const result = await service.toggleOpenStatus(req.params.userId as string);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getMenu = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const profile = await service.getDhaba(req.params.userId as string);
    if (!profile) {
      throw new AppError({
        statusCode: 404,
        code: 'FORBIDDEN',
        message: 'Dhaba profile not found',
      });
    }
    const menu = await service.getMenu(req.params.userId as string);
    res.json({ success: true, data: menu });
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
        message: 'You can only update your own dhaba profile',
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
    if (req.auth?.userId !== req.params.userId) {
      throw new AppError({
        statusCode: 403,
        code: 'FORBIDDEN',
        message: 'You can only update your own dhaba profile',
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
