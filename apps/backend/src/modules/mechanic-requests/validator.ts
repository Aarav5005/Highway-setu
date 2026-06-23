import { z } from 'zod';

export const createRequestSchema = {
  body: z.object({
    issue_type: z.string().min(2).max(100),
    description: z.string().optional(),
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }),
};

export const acceptRequestSchema = {
  body: z.object({
    quoted_amount: z.number().positive(),
  }),
  params: z.object({
    id: z.string().uuid(),
  }),
};

export const completeRequestSchema = {
  params: z.object({
    id: z.string().uuid(),
  }),
};

export const cancelRequestSchema = {
  params: z.object({
    id: z.string().uuid(),
  }),
};
