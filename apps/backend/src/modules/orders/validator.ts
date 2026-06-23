import { z } from 'zod';

export const createOrderSchema = {
  body: z.object({
    dhaba_id: z.string().uuid(),
    trip_id: z.string().uuid().optional(),
    eta_minutes: z.number().int().positive().optional(),
    items: z
      .array(
        z.object({
          menu_item_id: z.string().uuid(),
          quantity: z.number().int().positive(),
          price: z.number().positive(),
        })
      )
      .min(1),
  }),
};

export const acceptOrderSchema = {
  body: z.object({
    prep_time_minutes: z.number().int().positive(),
  }),
  params: z.object({
    id: z.string().uuid(),
  }),
};

export const rejectOrderSchema = {
  body: z.object({
    reason: z.string().min(3),
  }),
  params: z.object({
    id: z.string().uuid(),
  }),
};

export const updateStatusSchema = {
  body: z.object({
    status: z.enum(['preparing', 'ready', 'picked_up']),
  }),
  params: z.object({
    id: z.string().uuid(),
  }),
};

export const getOrderSchema = {
  params: z.object({
    id: z.string().uuid(),
  }),
};

export const dhabaOrdersQuerySchema = {
  query: z.object({
    status: z
      .enum(['pending', 'accepted', 'preparing', 'ready', 'picked_up', 'rejected', 'cancelled'])
      .optional(),
  }),
};
