import { z } from 'zod';

export const triggerSosSchema = {
  body: z.object({
    sos_type: z.enum(['accident', 'medical', 'breakdown', 'security']),
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }),
};

export const resolveSosSchema = {
  params: z.object({
    id: z.string().uuid(),
  }),
};
