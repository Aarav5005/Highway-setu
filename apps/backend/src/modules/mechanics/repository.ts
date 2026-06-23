import { dbPool } from '../../db/pool';

export const createMechanicProfile = async (
  userId: string,
  data: {
    shop_name: string;
    latitude: number;
    longitude: number;
    services_offered: any;
    can_travel: boolean;
    travel_radius_km: number;
    dl_number?: string;
    dl_doc_url?: string;
    address_line: string;
    state: string;
    district: string;
    pincode: string;
    phone_e164: string;
  }
) => {
  const result = await dbPool.query(
    `INSERT INTO mechanic_profiles (
      user_id, shop_name, latitude, longitude, 
      services_offered, can_travel, travel_radius_km, dl_number, dl_doc_url, 
      address_line, state, district, pincode, phone_e164, 
      location, is_verified
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
      ST_MakePoint($4, $3), false
    ) RETURNING *`,
    [
      userId,
      data.shop_name,
      data.latitude,
      data.longitude,
      data.services_offered,
      data.can_travel,
      data.travel_radius_km,
      data.dl_number,
      data.dl_doc_url,
      data.address_line,
      data.state,
      data.district,
      data.pincode,
      data.phone_e164,
    ]
  );
  return result.rows[0];
};

export const getMechanicById = async (id: string) => {
  const result = await dbPool.query(
    `SELECT m.*, u.phone_e164 as user_phone 
     FROM mechanic_profiles m 
     JOIN users u ON m.user_id = u.id 
     WHERE m.user_id = $1`,
    [id]
  );
  return result.rows[0];
};

export const updateMechanicProfile = async (
  id: string,
  updates: {
    shop_name?: string;
    services_offered?: any;
    can_travel?: boolean;
    travel_radius_km?: number;
  }
) => {
  const setClauses: string[] = [];
  const values: any[] = [];
  let paramIdx = 1;

  for (const [key, value] of Object.entries(updates)) {
    if (value !== undefined) {
      setClauses.push(`${key} = $${paramIdx}`);
      values.push(value);
      paramIdx++;
    }
  }

  if (setClauses.length === 0) return null;

  setClauses.push(`updated_at = now()`);
  values.push(id);

  const query = `
    UPDATE mechanic_profiles 
    SET ${setClauses.join(', ')} 
    WHERE user_id = $${paramIdx} 
    RETURNING *
  `;

  const result = await dbPool.query(query, values);
  return result.rows[0];
};
