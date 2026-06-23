import { dbPool } from '../../db/pool';

export const createDhabaProfile = async (
  userId: string,
  data: {
    dhaba_name: string;
    highway_name: string;
    latitude: number;
    longitude: number;
    fssai_number: string;
    fssai_doc_url: string;
    amenities: any;
    address_line: string;
    state: string;
    district: string;
    pincode: string;
    phone_e164: string;
  }
) => {
  const result = await dbPool.query(
    `INSERT INTO dhaba_profiles (
      user_id, dhaba_name, highway_name, latitude, longitude, 
      fssai_number, fssai_doc_url, amenities, 
      address_line, state, district, pincode, phone_e164, 
      location, is_verified, is_open
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13,
      ST_MakePoint($5, $4), false, true
    ) RETURNING *`,
    [
      userId,
      data.dhaba_name,
      data.highway_name,
      data.latitude,
      data.longitude,
      data.fssai_number,
      data.fssai_doc_url,
      data.amenities,
      data.address_line,
      data.state,
      data.district,
      data.pincode,
      data.phone_e164,
    ]
  );
  return result.rows[0];
};

export const getDhabaById = async (id: string) => {
  const result = await dbPool.query(`SELECT * FROM dhaba_profiles WHERE user_id = $1`, [id]);
  return result.rows[0];
};

export const updateDhabaProfile = async (
  id: string,
  updates: { dhaba_name?: string; highway_name?: string; amenities?: any; is_open?: boolean }
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
    UPDATE dhaba_profiles 
    SET ${setClauses.join(', ')} 
    WHERE user_id = $${paramIdx} 
    RETURNING *
  `;

  const result = await dbPool.query(query, values);
  return result.rows[0];
};

export const toggleDhabaOpen = async (id: string) => {
  const result = await dbPool.query(
    `UPDATE dhaba_profiles SET is_open = NOT is_open, updated_at = now() WHERE user_id = $1 RETURNING is_open`,
    [id]
  );
  return result.rows[0];
};

export const updateDhabaPhotos = async (userId: string, photos: string[]) => {
  // Simple replacement of photos for now
  await dbPool.query(`DELETE FROM dhaba_photos WHERE dhaba_user_id = $1`, [userId]);

  if (photos.length > 0) {
    const values = photos.map((url, i) => `('${userId}', '${url}', ${i + 1})`).join(', ');
    await dbPool.query(
      `INSERT INTO dhaba_photos (dhaba_user_id, photo_url, display_order) VALUES ${values}`
    );
  }
};

export const getDhabaPhotos = async (userId: string) => {
  const result = await dbPool.query(
    `SELECT photo_url FROM dhaba_photos WHERE dhaba_user_id = $1 ORDER BY display_order`,
    [userId]
  );
  return result.rows.map((r) => r.photo_url);
};

export const getDhabaMenu = async (dhabaId: string) => {
  const result = await dbPool.query(
    `SELECT * FROM menu_items WHERE dhaba_id = $1 AND is_available = true ORDER BY category, name_en`,
    [dhabaId]
  );
  return result.rows;
};
