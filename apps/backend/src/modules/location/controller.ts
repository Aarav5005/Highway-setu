import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../../errors/app-error';
import * as service from './service';

export const getNearbyDhabas = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);
    const radiusKm = Number(req.query.radius_km) || 20;

    const dhabas = await service.getNearbyDhabas(lat, lng, radiusKm);
    res.json({ success: true, data: dhabas });
  } catch (error) {
    next(error);
  }
};

export const getNearbyMechanics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);
    const radiusKm = Number(req.query.radius_km) || 20;
    const serviceFilter = req.query.service as string | undefined;

    const mechanics = await service.getNearbyMechanics(lat, lng, radiusKm, serviceFilter);
    res.json({ success: true, data: mechanics });
  } catch (error) {
    next(error);
  }
};

export const getTripPOIs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.auth?.role !== 'driver') {
      throw new AppError({
        statusCode: 403,
        code: 'FORBIDDEN',
        message: 'Only drivers can search trip POIs',
      });
    }
    const fromLat = Number(req.query.from_lat);
    const fromLng = Number(req.query.from_lng);
    const toLat = Number(req.query.to_lat);
    const toLng = Number(req.query.to_lng);

    const tripData = await service.getTripPOIs(fromLat, fromLng, toLat, toLng);
    res.json({ success: true, data: tripData });
  } catch (error) {
    next(error);
  }
};
