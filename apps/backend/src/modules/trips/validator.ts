import { z } from 'zod';

export const startTripSchema = {
  body: z.object({
    from_location: z.string().min(2),
    to_location: z.string().min(2),
    from_lat: z.number().min(-90).max(90),
    from_lng: z.number().min(-180).max(180),
    to_lat: z.number().min(-90).max(90),
    to_lng: z.number().min(-180).max(180),
  }),
};

export const updateLocationSchema = {
  body: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }),
  params: z.object({
    id: z.string().uuid(),
  }),
};

export const endTripSchema = {
  params: z.object({
    id: z.string().uuid(),
  }),
};
