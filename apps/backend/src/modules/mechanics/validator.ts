import { z } from 'zod';

export const mechanicServicesSchema = z.object({
  tyre: z.boolean().default(false),
  engine: z.boolean().default(false),
  electrical: z.boolean().default(false),
  welding: z.boolean().default(false),
  ac: z.boolean().default(false),
  crane: z.boolean().default(false),
});

export const registerMechanicSchema = {
  body: z
    .object({
      shop_name: z.string().min(2).max(100),
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180),
      services_offered: mechanicServicesSchema,
      can_travel: z.boolean().default(false),
      travel_radius_km: z.number().min(0).max(500).default(0),
      dl_number: z.string().optional(),
      dl_doc_url: z.string().url().optional(),
      address_line: z.string().min(5).optional().default('Highway'),
      state: z.string().min(2).optional().default('State'),
      district: z.string().min(2).optional().default('District'),
      pincode: z.string().min(6).optional().default('000000'),
      phone_e164: z.string().min(10).optional().default('+910000000000'),
    })
    .refine(
      (data) => {
        if (data.can_travel) {
          return !!data.dl_number && !!data.dl_doc_url;
        }
        return true;
      },
      {
        message: 'DL number and document URL are required if can_travel is true',
        path: ['can_travel'],
      }
    ),
};

export const updateMechanicSchema = {
  body: z.object({
    shop_name: z.string().min(2).max(100).optional(),
    services_offered: mechanicServicesSchema.optional(),
    can_travel: z.boolean().optional(),
    travel_radius_km: z.number().min(0).max(500).optional(),
  }),
  params: z.object({
    id: z.string().uuid(),
  }),
};

export const getMechanicSchema = {
  params: z.object({
    id: z.string().uuid(),
  }),
};
