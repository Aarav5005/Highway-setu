/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { AppError } from '../../errors/app-error';
import { env } from '../../config/env';
import * as tripsRepo from './repository';
import { getTripPOIs } from '../location/service';
import { firebaseMessaging } from '../../integrations/firebase';
import { dbPool } from '../../db/pool';

export const getActiveTripService = async (driverId: string) => {
  return tripsRepo.getActiveTrip(driverId);
};

export const getHistoryService = async (driverId: string) => {
  return tripsRepo.getHistory(driverId);
};

export const startTripService = async (
  driverId: string,
  data: {
    from_location: string;
    to_location: string;
    from_lat: number;
    from_lng: number;
    to_lat: number;
    to_lng: number;
  }
) => {
  await tripsRepo.cancelActiveTrip(driverId);

  const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${data.from_lat},${data.from_lng}&destination=${data.to_lat},${data.to_lng}&key=${env.GOOGLE_MAPS_API_KEY}`;
  const res = await fetch(url);
  const mapData = (await res.json()) as any;
  if (!res.ok || mapData.status !== 'OK') {
    throw new AppError({
      statusCode: 500,
      code: 'MAPS_API_ERROR',
      message: mapData.error_message || mapData.status || 'Failed to fetch directions',
    });
  }
  const polyline = mapData.routes[0].overview_polyline.points;
  const distanceMeters = mapData.routes[0].legs[0].distance.value;
  const distanceKm = distanceMeters / 1000;

  const trip = await tripsRepo.startTrip(
    driverId,
    data.from_location,
    data.to_location,
    data.from_lat,
    data.from_lng,
    data.to_lat,
    data.to_lng,
    polyline,
    distanceKm
  );

  const pois = await getTripPOIs(data.from_lat, data.from_lng, data.to_lat, data.to_lng);

  return {
    trip_id: trip.id,
    route_polyline: trip.route_polyline,
    distance_km: trip.distance_km,
    dhabas: pois.dhabas,
    mechanics: pois.mechanics,
  };
};

export const updateLocationService = async (
  tripId: string,
  driverId: string,
  lat: number,
  lng: number
) => {
  const trip = await tripsRepo.getTripByIdAndDriver(tripId, driverId);
  if (!trip || trip.status !== 'active') {
    throw new AppError({
      statusCode: 404,
      code: 'NOT_FOUND',
      message: 'Active trip not found',
    });
  }

  const now = new Date();
  const lastUpdated = new Date(trip.last_location_updated_at);
  const diffHours = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60);

  const newDrivingHours = parseFloat(trip.driving_hours) + diffHours;

  const updatedTrip = await tripsRepo.updateTripLocation(tripId, lat, lng, newDrivingHours);

  const alertsSent = (trip.alerts_sent as number[]) || [];
  const thresholds = [3, 5, 7];

  for (const threshold of thresholds) {
    if (newDrivingHours >= threshold && !alertsSent.includes(threshold)) {
      // Send FCM notification
      const userRes = await dbPool.query('SELECT fcm_token FROM users WHERE id = $1', [driverId]);
      const token = userRes.rows[0]?.fcm_token;
      if (token) {
        try {
          await firebaseMessaging.send({
            token,
            notification: {
              title: 'Rest Break Required',
              body: `You have been driving ${threshold} hours. Please take a rest break.`,
            },
          });
        } catch (error) {
          console.error('FCM Send Error:', error);
        }
      }
      alertsSent.push(threshold);
      await tripsRepo.updateAlertsSent(tripId, alertsSent);
    }
  }

  return updatedTrip;
};

export const endTripService = async (tripId: string, driverId: string) => {
  const trip = await tripsRepo.getTripByIdAndDriver(tripId, driverId);
  if (!trip || trip.status !== 'active') {
    throw new AppError({
      statusCode: 404,
      code: 'NOT_FOUND',
      message: 'Active trip not found',
    });
  }

  const endedTrip = await tripsRepo.endTrip(tripId);

  const start = new Date(endedTrip.started_at);
  const end = new Date(endedTrip.ended_at);
  const durationMins = Math.round((end.getTime() - start.getTime()) / 60000);

  // Loyalty Logic
  await dbPool.query(
    `UPDATE driver_profiles SET loyalty_points = loyalty_points + 5 WHERE user_id = $1`,
    [driverId]
  );
  await dbPool.query(
    `INSERT INTO loyalty_transactions (user_id, type, points, description, reference_id) VALUES ($1, $2, $3, $4, $5)`,
    [driverId, 'trip', 5, `Completed trip to ${endedTrip.to_location}`, tripId]
  );

  // Referral Logic
  const checkFirstTrip = await dbPool.query(
    "SELECT COUNT(*) FROM trips WHERE driver_id = $1 AND status = 'completed'",
    [driverId]
  );
  if (parseInt(checkFirstTrip.rows[0].count, 10) === 1) {
    const referralRes = await dbPool.query(
      "UPDATE referrals SET status = 'completed' WHERE referred_id = $1 AND status = 'pending' RETURNING referrer_id",
      [driverId]
    );
    const referrerId = referralRes.rows[0]?.referrer_id;
    if (referrerId) {
      const nameRes = await dbPool.query('SELECT phone_e164 FROM users WHERE id = $1', [driverId]);
      const referredPhone = nameRes.rows[0]?.phone_e164 || 'A user';

      const totalRes = await dbPool.query(
        "SELECT COUNT(*) FROM referrals WHERE referrer_id = $1 AND status = 'completed'",
        [referrerId]
      );
      const total = totalRes.rows[0].count;

      const tokenRes = await dbPool.query('SELECT fcm_token FROM users WHERE id = $1', [
        referrerId,
      ]);
      const token = tokenRes.rows[0]?.fcm_token;
      if (token) {
        try {
          await firebaseMessaging.send({
            token,
            notification: {
              title: 'Referral Bonus!',
              body: `🎉 ${referredPhone} joined using your referral! You have ${total} referrals now.`,
            },
          });
        } catch (e) {
          console.error('FCM Error for referrals', e);
        }
      }
    }
  }

  return {
    from_location: endedTrip.from_location,
    to_location: endedTrip.to_location,
    distance_km: endedTrip.distance_km,
    total_driving_hours: endedTrip.driving_hours,
    duration_minutes: durationMins,
  };
};
