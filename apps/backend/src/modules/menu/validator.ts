import { z } from 'zod';

export const createMenuSchema = {
  body: z.object({
    dhaba_id: z.string().uuid(),
    name_en: z.string().min(2).max(100),
    name_hi: z.string().max(100).optional(),
    name_pa: z.string().max(100).optional(),
    price: z.number().min(0),
    category: z.string().min(2).max(50),
    photo_url: z.string().url().optional(),
  }),
};

export const updateMenuSchema = {
  body: z.object({
    name_en: z.string().min(2).max(100).optional(),
    name_hi: z.string().max(100).optional(),
    name_pa: z.string().max(100).optional(),
    price: z.number().min(0).optional(),
    category: z.string().min(2).max(50).optional(),
    is_available: z.boolean().optional(),
    photo_url: z.string().url().optional(),
  }),
  params: z.object({
    id: z.string().uuid(),
  }),
};

export const deleteMenuSchema = {
  params: z.object({
    id: z.string().uuid(),
  }),
};
