import { dbPool } from '../../db/pool';

export const createMenuItem = async (data: any) => {
  const result = await dbPool.query(
    `INSERT INTO menu_items (
      dhaba_id, name_en, name_hi, name_pa, price, category, photo_url
    ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [
      data.dhaba_id,
      data.name_en,
      data.name_hi,
      data.name_pa,
      data.price,
      data.category,
      data.photo_url,
    ]
  );
  return result.rows[0];
};

export const getMenuItemById = async (id: string) => {
  const result = await dbPool.query(`SELECT * FROM menu_items WHERE id = $1`, [id]);
  return result.rows[0];
};

export const updateMenuItem = async (id: string, updates: any) => {
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
    UPDATE menu_items 
    SET ${setClauses.join(', ')} 
    WHERE id = $${paramIdx} 
    RETURNING *
  `;

  const result = await dbPool.query(query, values);
  return result.rows[0];
};

export const deleteMenuItem = async (id: string) => {
  const result = await dbPool.query(
    `UPDATE menu_items SET is_available = false, updated_at = now() WHERE id = $1 RETURNING *`,
    [id]
  );
  return result.rows[0];
};
