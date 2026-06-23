import { type NextFunction, type Request, type RequestHandler, type Response } from 'express';
import { z } from 'zod';
import { AppError } from '../../errors/app-error';

const fullNameSchema = z.string().trim().min(2).max(100);
const licenseNumberSchema = z.string().trim().min(4).max(40);
const truckRegistrationSchema = z.string().trim().min(1);
const truckTypeSchema = z.string().trim().min(1);

const profileBodySchema = z.object({
  fullName: fullNameSchema,
  licenseNumber: licenseNumberSchema,
  truckRegistrationNumber: truckRegistrationSchema,
  truckType: truckTypeSchema,
});

const truckBodySchema = z.object({
  truckRegistrationNumber: truckRegistrationSchema,
  truckType: truckTypeSchema,
});

const formatIssues = (issues: z.ZodIssue[]) =>
  issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
    code: issue.code,
  }));

const createValidationMiddleware = (
  schema: z.ZodTypeAny,
  code: string,
  message: string
): RequestHandler => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      next(
        new AppError({
          statusCode: 400,
          code,
          message,
          details: formatIssues(result.error.issues),
        })
      );
      return;
    }

    req.body = result.data;
    next();
  };
};

export const validateDriverProfile = createValidationMiddleware(
  profileBodySchema,
  'DRIVER_INVALID_PROFILE',
  'Driver profile payload is invalid'
);

export const validateDriverTruck = createValidationMiddleware(
  truckBodySchema,
  'DRIVER_INVALID_TRUCK',
  'Driver truck payload is invalid'
);
