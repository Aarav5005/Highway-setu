import { dbPool } from '../../db/pool';

export const createOrder = async (
  driverId: string,
  dhabaId: string,
  tripId: string | undefined,
  items: any[],
  totalAmount: number,
  etaMinutes?: number
) => {
  const result = await dbPool.query(
    `INSERT INTO food_orders (
      driver_id, dhaba_id, trip_id, items, total_amount, eta_minutes
    ) VALUES ($1, $2, $3, $4::jsonb, $5, $6) RETURNING *`,
    [driverId, dhabaId, tripId || null, JSON.stringify(items), totalAmount, etaMinutes || null]
  );
  return result.rows[0];
};

export const getOrderById = async (id: string) => {
  const result = await dbPool.query('SELECT * FROM food_orders WHERE id = $1', [id]);
  return result.rows[0];
};

export const updateOrderStatus = async (
  id: string,
  status: string,
  paymentStatus?: string,
  rejectionReason?: string
) => {
  let query = `UPDATE food_orders SET status = $1, updated_at = now()`;
  const params: any[] = [status];
  let paramCount = 2;

  if (paymentStatus) {
    query += `, payment_status = $${paramCount}`;
    params.push(paymentStatus);
    paramCount++;
  }
  if (rejectionReason) {
    query += `, rejection_reason = $${paramCount}`;
    params.push(rejectionReason);
    paramCount++;
  }

  query += ` WHERE id = $${paramCount} RETURNING *`;
  params.push(id);

  const result = await dbPool.query(query, params);
  return result.rows[0];
};

export const getDriverOrders = async (driverId: string) => {
  const result = await dbPool.query(
    `SELECT fo.*, d.dhaba_name 
     FROM food_orders fo
     JOIN dhaba_profiles d ON fo.dhaba_id = d.id
     WHERE fo.driver_id = $1
     ORDER BY fo.created_at DESC
     LIMIT 20`,
    [driverId]
  );
  return result.rows;
};

export const getDhabaOrders = async (dhabaId: string, status?: string) => {
  let query = `SELECT fo.*, u.phone_e164 as driver_phone 
               FROM food_orders fo
               JOIN users u ON fo.driver_id = u.id
               WHERE fo.dhaba_id = $1`;
  const params: any[] = [dhabaId];
  if (status) {
    query += ` AND fo.status = $2`;
    params.push(status);
  }
  query += ` ORDER BY fo.created_at DESC LIMIT 50`;

  const result = await dbPool.query(query, params);
  return result.rows;
};

export const getMenuItems = async (dhabaId: string) => {
  const result = await dbPool.query(`SELECT id, price FROM menu_items WHERE dhaba_id = $1`, [
    dhabaId,
  ]);
  return result.rows;
};
