import { type Request, type Response, type NextFunction } from 'express';
import * as sosService from './service';

export const triggerSos = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const driverId = req.auth?.userId as string;
    const result = await sosService.triggerSosService(driverId, req.body);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const resolveSos = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const driverId = req.auth?.userId as string;
    const result = await sosService.resolveSosService(id as string, driverId);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getActiveSos = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const driverId = req.auth?.userId as string;
    const result = await sosService.getActiveSosService(driverId);
    res.status(200).json({ success: true, data: result || null });
  } catch (error) {
    next(error);
  }
};
