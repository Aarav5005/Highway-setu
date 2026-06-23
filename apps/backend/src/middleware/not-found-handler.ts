import { type NextFunction, type Request, type Response } from 'express';
import { AppError } from '../errors/app-error';

export const notFoundHandler = (req: Request, _res: Response, next: NextFunction) => {
  next(
    new AppError({
      statusCode: 404,
      code: 'ROUTE_NOT_FOUND',
      message: `No route registered for ${req.method} ${req.originalUrl}`,
    })
  );
};
