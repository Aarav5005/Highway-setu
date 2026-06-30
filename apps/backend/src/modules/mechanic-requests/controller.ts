import { type Request, type Response, type NextFunction } from 'express';
import * as mrService from './service';

export const createRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const driverId = req.auth?.userId as string;
    const driverName = 'Driver'; // To be fetched dynamically in a real app
    const result = await mrService.createRequestService(driverId, driverName, req.body);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const acceptRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const mechanicId = req.auth?.userId as string;
    const { quoted_amount } = req.body;

    // For simplicity, passing mock mechanic details; real app would fetch from user profile
    const mechanicName = 'Mechanic';
    const mechanicPhone = '1234567890';

    const result = await mrService.acceptRequestService(
      id as string,
      mechanicId,
      mechanicName,
      mechanicPhone,
      quoted_amount
    );
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const completeRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const mechanicId = req.auth?.userId as string;
    const result = await mrService.completeRequestService(id as string, mechanicId);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const cancelRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const driverId = req.auth?.userId as string;
    const result = await mrService.cancelRequestService(id as string, driverId);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getDriverRequests = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const driverId = req.auth?.userId as string;
    const result = await mrService.getDriverRequestsService(driverId);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getIncomingRequests = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const mechanicId = req.auth?.userId as string;
    const result = await mrService.getIncomingRequestsService(mechanicId);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getMechanicHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const mechanicId = req.auth?.userId as string;
    const result = await mrService.getMechanicHistoryService(mechanicId);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
