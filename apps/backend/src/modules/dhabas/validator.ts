import { z } from 'zod';

export const dhabaAmenitiesSchema = z.object({
  truck_parking: z.boolean().default(false),
  ac: z.boolean().default(false),
  dormitory: z.boolean().default(false),
  wifi: z.boolean().default(false),
  shower: z.boolean().default(false),
  toilet: z.boolean().default(false),
});

export const registerDhabaSchema = {
  body: z.object({
    dhaba_name: z.string().min(2).max(100),
    highway_name: z.string().min(2).max(100),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    fssai_number: z.string().min(5).max(50),
    fssai_doc_url: z.string().url(),
    amenities: dhabaAmenitiesSchema,
    address_line: z.string().min(5).optional().default('Highway'),
    state: z.string().min(2).optional().default('State'),
    district: z.string().min(2).optional().default('District'),
    pincode: z.string().min(6).optional().default('000000'),
    phone_e164: z.string().min(10).optional().default('+910000000000'),
  }),
};

export const updateDhabaSchema = {
  body: z.object({
    dhaba_name: z.string().min(2).max(100).optional(),
    highway_name: z.string().min(2).max(100).optional(),
    amenities: dhabaAmenitiesSchema.optional(),
    is_open: z.boolean().optional(),
    photos: z.array(z.string().url()).optional(),
  }),
  params: z.object({
    id: z.string().uuid(),
  }),
};

export const toggleOpenSchema = {
  params: z.object({
    id: z.string().uuid(),
  }),
};

export const getDhabaSchema = {
  params: z.object({
    id: z.string().uuid(),
  }),
};
