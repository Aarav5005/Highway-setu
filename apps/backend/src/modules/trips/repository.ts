import { dbPool } from '../../db/pool';

export const getActiveTrip = async (driverId: string) => {
  const result = await dbPool.query('SELECT * FROM trips WHERE driver_id = $1 AND status = $2::trip_status', [
    driverId,
    'active',
  ]);
  return result.rows[0];
};

export const cancelActiveTrip = async (driverId: string) => {
  await dbPool.query(
    `UPDATE trips SET status = 'cancelled', ended_at = now() WHERE driver_id = $1 AND status = 'active'`,
    [driverId]
  );
};

export const startTrip = async (
  driverId: string,
  fromLoc: string,
  toLoc: string,
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number,
  polyline: string,
  distanceKm: number
) => {
  const result = await dbPool.query(
    `INSERT INTO trips (
      driver_id, from_location, to_location, from_coords, to_coords, 
      route_polyline, distance_km, status, alerts_sent, 
      last_location, last_location_updated_at
    ) VALUES (
      $1, $2, $3, ST_SetSRID(ST_MakePoint($5, $4), 4326), ST_SetSRID(ST_MakePoint($7, $6), 4326),
      $8, $9, 'active', '[]'::jsonb,
      ST_SetSRID(ST_MakePoint($5, $4), 4326), now()
    ) RETURNING id, route_polyline, distance_km`,
    [driverId, fromLoc, toLoc, fromLat, fromLng, toLat, toLng, polyline, distanceKm]
  );
  return result.rows[0];
};

export const getTripByIdAndDriver = async (tripId: string, driverId: string) => {
  const result = await dbPool.query('SELECT * FROM trips WHERE id = $1 AND driver_id = $2', [
    tripId,
    driverId,
  ]);
  return result.rows[0];
};

export const updateTripLocation = async (
  tripId: string,
  lat: number,
  lng: number,
  drivingHours: number
) => {
  const result = await dbPool.query(
    `UPDATE trips 
     SET last_location = ST_SetSRID(ST_MakePoint($2, $1), 4326),
         last_location_updated_at = now(),
         driving_hours = $3
     WHERE id = $4
     RETURNING *`,
    [lat, lng, drivingHours, tripId]
  );
  return result.rows[0];
};

export const updateAlertsSent = async (tripId: string, alertsArray: number[]) => {
  await dbPool.query(`UPDATE trips SET alerts_sent = $1::jsonb WHERE id = $2`, [
    JSON.stringify(alertsArray),
    tripId,
  ]);
};

export const endTrip = async (tripId: string) => {
  const result = await dbPool.query(
    `UPDATE trips 
     SET status = 'completed', ended_at = now()
     WHERE id = $1
     RETURNING *`,
    [tripId]
  );
  return result.rows[0];
};

export const getHistory = async (driverId: string) => {
  const result = await dbPool.query(
    `SELECT id, from_location, to_location, distance_km, status, started_at, ended_at, driving_hours
     FROM trips 
     WHERE driver_id = $1 AND status = 'completed'
     ORDER BY ended_at DESC
     LIMIT 10`,
    [driverId]
  );
  return result.rows;
};
