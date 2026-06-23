import { dbPool } from '../../db/pool';

export const createRequest = async (
  driverId: string,
  issueType: string,
  description: string | undefined,
  lat: number,
  lng: number
) => {
  const result = await dbPool.query(
    `INSERT INTO mechanic_requests (
      driver_id, issue_type, description, location
    ) VALUES (
      $1, $2, $3, ST_SetSRID(ST_MakePoint($5, $4), 4326)
    ) RETURNING *`,
    [driverId, issueType, description || null, lat, lng]
  );
  return result.rows[0];
};

export const getRequestById = async (id: string) => {
  const result = await dbPool.query('SELECT * FROM mechanic_requests WHERE id = $1', [id]);
  return result.rows[0];
};

export const acceptRequest = async (
  id: string,
  mechanicId: string,
  quotedAmount: number,
  platformFeePct: number,
  platformFeeAmount: number,
  netAmount: number
) => {
  const result = await dbPool.query(
    `UPDATE mechanic_requests 
     SET mechanic_id = $1, status = 'accepted', quoted_amount = $2, 
         platform_fee_pct = $3, platform_fee_amount = $4, net_amount = $5, updated_at = now()
     WHERE id = $6 RETURNING *`,
    [mechanicId, quotedAmount, platformFeePct, platformFeeAmount, netAmount, id]
  );
  return result.rows[0];
};

export const completeRequest = async (id: string) => {
  const result = await dbPool.query(
    `UPDATE mechanic_requests 
     SET status = 'completed', payment_status = 'completed', updated_at = now()
     WHERE id = $1 RETURNING *`,
    [id]
  );
  return result.rows[0];
};

export const cancelRequest = async (id: string) => {
  const result = await dbPool.query(
    `UPDATE mechanic_requests 
     SET status = 'cancelled', updated_at = now()
     WHERE id = $1 RETURNING *`,
    [id]
  );
  return result.rows[0];
};

export const getDriverRequests = async (driverId: string) => {
  const result = await dbPool.query(
    `SELECT mr.*, u.phone_e164 as mechanic_phone 
     FROM mechanic_requests mr
     LEFT JOIN users u ON mr.mechanic_id = u.id
     WHERE mr.driver_id = $1
     ORDER BY mr.created_at DESC
     LIMIT 10`,
    [driverId]
  );
  return result.rows;
};

export const getIncomingRequests = async (mechanicLat: number, mechanicLng: number) => {
  // 20km radius = 20000 meters
  const result = await dbPool.query(
    `SELECT mr.*, 
       ST_Distance(
         mr.location::geography,
         ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
       ) / 1000 AS distance_km
     FROM mechanic_requests mr
     WHERE mr.status = 'pending'
       AND ST_DWithin(
         mr.location::geography,
         ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
         20000
       )
     ORDER BY distance_km ASC`,
    [mechanicLng, mechanicLat]
  );
  return result.rows;
};
