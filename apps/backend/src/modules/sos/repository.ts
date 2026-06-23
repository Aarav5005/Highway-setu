import { dbPool } from '../../db/pool';

export const createSosAlert = async (
  driverId: string,
  sosType: string,
  lat: number,
  lng: number,
  dispatchedTo: string[]
) => {
  const result = await dbPool.query(
    `INSERT INTO sos_alerts (
      driver_id, sos_type, location, dispatched_to, emergency_contacts_notified
    ) VALUES (
      $1, $2, ST_SetSRID(ST_MakePoint($4, $3), 4326), $5::jsonb, true
    ) RETURNING *`,
    [driverId, sosType, lat, lng, JSON.stringify(dispatchedTo)]
  );
  return result.rows[0];
};

export const getSosById = async (id: string) => {
  const result = await dbPool.query('SELECT * FROM sos_alerts WHERE id = $1', [id]);
  return result.rows[0];
};

export const resolveSosAlert = async (id: string) => {
  const result = await dbPool.query(
    `UPDATE sos_alerts 
     SET status = 'resolved', resolved_at = now()
     WHERE id = $1 RETURNING *`,
    [id]
  );
  return result.rows[0];
};

export const getActiveSos = async (driverId: string) => {
  const result = await dbPool.query(
    `SELECT * FROM sos_alerts WHERE driver_id = $1 AND status = 'active'`,
    [driverId]
  );
  return result.rows[0];
};
