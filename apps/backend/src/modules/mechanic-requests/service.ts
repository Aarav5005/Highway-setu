import { AppError } from '../../errors/app-error';
import * as mrRepo from './repository';
import { getNearbyMechanics } from '../location/service';
import { firebaseMessaging } from '../../integrations/firebase';
import { dbPool } from '../../db/pool';

const sendFcm = async (userId: string, title: string, body: string) => {
  const res = await dbPool.query('SELECT fcm_token FROM users WHERE id = $1', [userId]);
  const token = res.rows[0]?.fcm_token;
  if (token) {
    try {
      await firebaseMessaging.send({ token, notification: { title, body } });
    } catch (e) {
      console.error('FCM Error:', e);
    }
  }
};

export const createRequestService = async (
  driverId: string,
  driverName: string,
  data: { issue_type: string; description?: string; lat: number; lng: number }
) => {
  const request = await mrRepo.createRequest(
    driverId,
    data.issue_type,
    data.description,
    data.lat,
    data.lng
  );

  // Find nearest 3 mechanics
  const mechanics = await getNearbyMechanics(data.lat, data.lng, 20);
  const nearest = mechanics.slice(0, 3);

  // Send FCM to each mechanic
  for (const mech of nearest) {
    await sendFcm(
      mech.id,
      'New Job Request',
      `New job request: ${data.issue_type}, ${mech.distance_km.toFixed(1)}km from you. Driver: ${driverName}. Cash payment.`
    );
  }

  return request;
};

export const acceptRequestService = async (
  id: string,
  mechanicId: string,
  mechanicName: string,
  mechanicPhone: string,
  quotedAmount: number
) => {
  const req = await mrRepo.getRequestById(id);
  if (!req || req.status !== 'pending') {
    throw new AppError({
      statusCode: 400,
      code: 'INVALID_STATE',
      message: 'Request is no longer pending',
    });
  }

  const platformFeePct = 10.0;
  const platformFeeAmount = (quotedAmount * platformFeePct) / 100;
  const netAmount = quotedAmount - platformFeeAmount;

  const updated = await mrRepo.acceptRequest(
    id,
    mechanicId,
    quotedAmount,
    platformFeePct,
    platformFeeAmount,
    netAmount
  );

  await sendFcm(
    req.driver_id,
    'Mechanic En Route',
    `Mechanic ${mechanicName} is coming. Quoted: ₹${quotedAmount}. Contact: ${mechanicPhone}. Pay cash on completion.`
  );

  return updated;
};

export const completeRequestService = async (id: string, mechanicId: string) => {
  const req = await mrRepo.getRequestById(id);
  if (!req || req.mechanic_id !== mechanicId || req.status !== 'accepted') {
    throw new AppError({
      statusCode: 400,
      code: 'INVALID_STATE',
      message: 'Invalid request state or permission',
    });
  }

  const updated = await mrRepo.completeRequest(id);

  await sendFcm(
    req.driver_id,
    'Job Completed',
    `Job marked complete by mechanic. Please pay ₹${req.quoted_amount} cash.`
  );

  return updated;
};

export const cancelRequestService = async (id: string, driverId: string) => {
  const req = await mrRepo.getRequestById(id);
  if (!req || req.driver_id !== driverId || req.status !== 'pending') {
    throw new AppError({
      statusCode: 400,
      code: 'INVALID_STATE',
      message: 'Cannot cancel request',
    });
  }

  return mrRepo.cancelRequest(id);
};

export const getDriverRequestsService = async (driverId: string) => {
  return mrRepo.getDriverRequests(driverId);
};

export const getIncomingRequestsService = async (mechanicId: string) => {
  const mechRes = await dbPool.query(
    'SELECT ST_Y(location::geometry) as lat, ST_X(location::geometry) as lng FROM mechanic_profiles WHERE user_id = $1',
    [mechanicId]
  );
  if (!mechRes.rows[0]) return [];

  const { lat, lng } = mechRes.rows[0];
  return mrRepo.getIncomingRequests(lat, lng);
};
