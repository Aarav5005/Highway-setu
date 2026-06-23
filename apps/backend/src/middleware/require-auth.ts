import { type NextFunction, type Request, type Response } from 'express';
import { AppError } from '../errors/app-error';
import type { UserRole } from '../auth/auth-types';
import { verifyAccessToken } from '../auth/token-service';

const parseBearerToken = (req: Request) => {
  const value = req.header('authorization');
  if (!value) {
    throw new AppError({
      statusCode: 401,
      code: 'AUTH_UNAUTHORIZED',
      message: 'Authorization header is required',
    });
  }

  const [scheme, token] = value.split(' ');
  if (scheme !== 'Bearer' || !token) {
    throw new AppError({
      statusCode: 401,
      code: 'AUTH_UNAUTHORIZED',
      message: 'Authorization header must be in Bearer format',
    });
  }

  return token;
};

export const requireAuth = (allowedRoles?: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const token = parseBearerToken(req);
      const claims = verifyAccessToken(token);

      req.auth = {
        userId: claims.sub,
        role: claims.role,
      };

      if (allowedRoles && !allowedRoles.includes(claims.role)) {
        throw new AppError({
          statusCode: 403,
          code: 'AUTH_FORBIDDEN',
          message: 'You do not have permission to access this resource',
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
