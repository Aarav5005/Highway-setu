import { type Request, type Response, type NextFunction } from 'express';
import * as ordersService from './service';

export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const driverId = req.auth?.userId;
    const result = await ordersService.createOrderService(driverId as string, 'Driver', req.body);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.auth?.userId as string;
    const role = req.auth?.role as string;
    const result = await ordersService.getOrderService(id as string, userId, role);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const acceptOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.auth?.userId as string;
    const { prep_time_minutes } = req.body;
    const result = await ordersService.acceptOrderService(id as string, userId, prep_time_minutes);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const rejectOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.auth?.userId as string;
    const { reason } = req.body;
    const result = await ordersService.rejectOrderService(id as string, userId, reason);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const updateStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.auth?.userId as string;
    const { status } = req.body;
    const result = await ordersService.updateStatusService(id as string, userId, status);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getDriverOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const driverId = req.auth?.userId as string;
    const result = await ordersService.getDriverOrdersService(driverId);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getDhabaOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dhabaOwnerId = req.auth?.userId as string;
    const status = req.query.status as string;
    const result = await ordersService.getDhabaOrdersService(dhabaOwnerId, status);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
