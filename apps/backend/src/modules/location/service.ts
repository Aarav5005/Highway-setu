/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { env } from '../../config/env';
import { dbPool } from '../../db/pool';

export const getNearbyDhabas = async (lat: number, lng: number, radiusKm: number) => {
  const query = `
    SELECT 
      user_id as id, 
      dhaba_name, 
      avg_rating, 
      amenities, 
      is_open,
      ST_Distance(
        location::geography,
        ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
      ) / 1000 AS distance_km
    FROM dhaba_profiles
    WHERE is_verified = true 
      AND is_open = true
      AND ST_DWithin(
        location::geography,
        ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
        $3 * 1000
      )
    ORDER BY distance_km ASC
  `;
  const result = await dbPool.query(query, [lng, lat, radiusKm]);
  return result.rows;
};

export const getNearbyMechanics = async (
  lat: number,
  lng: number,
  radiusKm: number,
  service?: string
) => {
  let query = `
    SELECT 
      m.user_id as id, 
      m.shop_name, 
      m.services_offered, 
      m.can_travel,
      u.phone_e164 as phone,
      ST_Distance(
        m.location::geography,
        ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
      ) / 1000 AS distance_km
    FROM mechanic_profiles m
    JOIN users u ON m.user_id = u.id
    WHERE m.is_verified = true 
      AND ST_DWithin(
        m.location::geography,
        ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
        $3 * 1000
      )
  `;

  const params: any[] = [lng, lat, radiusKm];

  if (service) {
    // Check if the service key is true in the JSONB object
    query += ` AND m.services_offered->>$4 = 'true'`;
    params.push(service);
  }

  query += ` ORDER BY distance_km ASC`;

  const result = await dbPool.query(query, params);
  return result.rows;
};

export const getTripPOIs = async (
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number
) => {
  const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${fromLat},${fromLng}&destination=${toLat},${toLng}&key=${env.GOOGLE_MAPS_API_KEY}`;
  const res = await fetch(url);
  const data = (await res.json()) as any;
  if (!res.ok || data.status !== 'OK') {
    throw new Error(data.error_message || data.status || 'Failed to fetch directions');
  }
  const polylineStr = data.routes[0].overview_polyline.points;

  // Search distance is 5km
  const searchDistanceMeters = 5000;

  const dhabasQuery = `
    SELECT 
      user_id as id, dhaba_name, avg_rating, amenities, is_open
    FROM dhaba_profiles
    WHERE is_verified = true AND is_open = true
      AND ST_DWithin(
        location::geography,
        ST_LineFromEncodedPolyline($1, 5)::geography,
        $2
      )
  `;
  const dhabasResult = await dbPool.query(dhabasQuery, [polylineStr, searchDistanceMeters]);

  const mechanicsQuery = `
    SELECT 
      m.user_id as id, m.shop_name, m.services_offered, m.can_travel, u.phone_e164 as phone
    FROM mechanic_profiles m
    JOIN users u ON m.user_id = u.id
    WHERE m.is_verified = true
      AND ST_DWithin(
        m.location::geography,
        ST_LineFromEncodedPolyline($1, 5)::geography,
        $2
      )
  `;
  const mechanicsResult = await dbPool.query(mechanicsQuery, [polylineStr, searchDistanceMeters]);

  return {
    route_polyline: polylineStr,
    dhabas: dhabasResult.rows,
    mechanics: mechanicsResult.rows,
    fuel_stations: [], // Empty for now as requested
  };
};
