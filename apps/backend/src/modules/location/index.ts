import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../../middleware/require-auth';
import { validateRequest } from '../../middleware/validate-request';
import * as controller from './controller';

export const locationRouter = Router();

locationRouter.get(
  '/nearby-dhabas',
  requireAuth(),
  validateRequest({
    query: z.object({
      lat: z.coerce.number().min(-90).max(90),
      lng: z.coerce.number().min(-180).max(180),
      radius_km: z.coerce.number().min(1).max(500).optional().default(20),
    }),
  }),
  controller.getNearbyDhabas
);

locationRouter.get(
  '/nearby-mechanics',
  requireAuth(),
  validateRequest({
    query: z.object({
      lat: z.coerce.number().min(-90).max(90),
      lng: z.coerce.number().min(-180).max(180),
      radius_km: z.coerce.number().min(1).max(500).optional().default(20),
      service: z.string().optional(),
    }),
  }),
  controller.getNearbyMechanics
);

locationRouter.get(
  '/trip-pois',
  requireAuth(),
  validateRequest({
    query: z.object({
      from_lat: z.coerce.number().min(-90).max(90),
      from_lng: z.coerce.number().min(-180).max(180),
      to_lat: z.coerce.number().min(-90).max(90),
      to_lng: z.coerce.number().min(-180).max(180),
    }),
  }),
  controller.getTripPOIs
);
