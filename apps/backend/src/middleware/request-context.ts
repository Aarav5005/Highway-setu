import { randomUUID } from 'node:crypto';
import { type NextFunction, type Request, type Response } from 'express';

export const requestContext = (req: Request, res: Response, next: NextFunction) => {
  const incomingRequestId = req.header('x-request-id');
  const requestId =
    incomingRequestId && incomingRequestId.length > 0 ? incomingRequestId : randomUUID();

  req.requestId = requestId;
  res.setHeader('x-request-id', requestId);
  next();
};
