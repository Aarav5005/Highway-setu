import { type Request, type Response, type NextFunction } from 'express';
import * as tripsService from './service';

export const startTrip = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const driverId = req.auth?.userId;
    const result = await tripsService.startTripService(driverId as string, req.body);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const updateLocation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const driverId = req.auth?.userId;
    const { id } = req.params;
    const { lat, lng } = req.body;
    await tripsService.updateLocationService(id as string, driverId as string, lat, lng);
    res.status(200).json({ success: true, message: 'Location updated' });
  } catch (error) {
    next(error);
  }
};

export const endTrip = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const driverId = req.auth?.userId;
    const { id } = req.params;
    const result = await tripsService.endTripService(id as string, driverId as string);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const driverId = req.auth?.userId;
    const result = await tripsService.getHistoryService(driverId as string);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getActive = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const driverId = req.auth?.userId;
    const result = await tripsService.getActiveTripService(driverId as string);
    res.status(200).json({ success: true, data: result || null });
  } catch (error) {
    next(error);
  }
};
