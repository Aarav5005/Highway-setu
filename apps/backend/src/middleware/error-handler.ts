import { type NextFunction, type Request, type Response } from 'express';
import { AppError } from '../errors/app-error';
import { logger } from '../utils/logger';

type ErrorEnvelope = {
  code: string;
  message: string;
  details: unknown;
  requestId: string;
};

export const errorHandler = (
  error: unknown,
  req: Request,
  res: Response<ErrorEnvelope>,
  _next: NextFunction
) => {
  const requestId = req.requestId ?? 'unknown';

  if (error instanceof AppError) {
    logger.warn(
      {
        requestId,
        code: error.code,
        statusCode: error.statusCode,
        details: error.details,
      },
      error.message
    );

    res.status(error.statusCode).json({
      code: error.code,
      message: error.message,
      details: error.details ?? null,
      requestId,
    });
    return;
  }

  logger.error(
    {
      requestId,
      err: error,
    },
    'Unhandled internal error'
  );

  res.status(500).json({
    code: 'INTERNAL_SERVER_ERROR',
    message: 'An internal error occurred',
    details: null,
    requestId,
  });
};
