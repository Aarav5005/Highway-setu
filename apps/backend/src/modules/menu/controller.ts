import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../../errors/app-error';
import * as service from './service';

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.auth?.role !== 'dhaba_owner' || req.body.dhaba_id !== req.auth?.userId) {
      throw new AppError({
        statusCode: 403,
        code: 'FORBIDDEN',
        message: 'You can only add items to your own dhaba',
      });
    }
    const item = await service.createMenu(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = await service.getMenuItem(req.params.id as string);
    if (!item)
      throw new AppError({ statusCode: 404, code: 'FORBIDDEN', message: 'Menu item not found' });

    if (req.auth?.role !== 'dhaba_owner' || item.dhaba_id !== req.auth?.userId) {
      throw new AppError({
        statusCode: 403,
        code: 'FORBIDDEN',
        message: 'You can only update your own menu items',
      });
    }
    const updated = await service.updateMenu(req.params.id as string, req.body);
    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = await service.getMenuItem(req.params.id as string);
    if (!item)
      throw new AppError({ statusCode: 404, code: 'FORBIDDEN', message: 'Menu item not found' });

    if (req.auth?.role !== 'dhaba_owner' || item.dhaba_id !== req.auth?.userId) {
      throw new AppError({
        statusCode: 403,
        code: 'FORBIDDEN',
        message: 'You can only delete your own menu items',
      });
    }
    const deleted = await service.deleteMenu(req.params.id as string);
    res.json({ success: true, data: deleted });
  } catch (error) {
    next(error);
  }
};
