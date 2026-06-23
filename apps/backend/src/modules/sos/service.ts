import { AppError } from '../../errors/app-error';
import * as sosRepo from './repository';
import { getNearbyMechanics, getNearbyDhabas } from '../location/service';
import { firebaseMessaging } from '../../integrations/firebase';
import { dbPool } from '../../db/pool';

const sendFcmMulti = async (userIds: string[], title: string, body: string) => {
  if (userIds.length === 0) return;
  const placeholders = userIds.map((_, i) => `$${i + 1}`).join(',');
  const res = await dbPool.query(
    `SELECT fcm_token FROM users WHERE id IN (${placeholders})`,
    userIds
  );
  const tokens = res.rows.map((r) => r.fcm_token).filter(Boolean);

  if (tokens.length > 0) {
    try {
      await firebaseMessaging.sendEachForMulticast({
        tokens,
        notification: { title, body },
        android: { priority: 'high' },
      });
    } catch (e) {
      console.error('FCM Error:', e);
    }
  }
};

export const triggerSosService = async (
  driverId: string,
  data: { sos_type: string; lat: number; lng: number }
) => {
  // Find 5 mechanics within 20km
  const mechanics = await getNearbyMechanics(data.lat, data.lng, 20);
  const nearestMechanics = mechanics.slice(0, 5);

  // Find 3 dhabas within 10km
  const dhabas = await getNearbyDhabas(data.lat, data.lng, 10);
  const nearestDhabas = dhabas.slice(0, 3);

  const dispatchedToIds = [...nearestMechanics.map((m) => m.id), ...nearestDhabas.map((d) => d.id)];

  const alert = await sosRepo.createSosAlert(
    driverId,
    data.sos_type,
    data.lat,
    data.lng,
    dispatchedToIds
  );

  // Send high priority FCM
  if (dispatchedToIds.length > 0) {
    // Actually we need to calculate distances to send them custom messages ideally,
    // but the prompt says: "distance km from you".
    // To do that we need to send individual messages.
    const allUsers = [...nearestMechanics, ...nearestDhabas];
    for (const u of allUsers) {
      const distance = u.distance_km ? u.distance_km.toFixed(1) : 'some';
      const tokenRes = await dbPool.query('SELECT fcm_token FROM users WHERE id = $1', [u.id]);
      const token = tokenRes.rows[0]?.fcm_token;
      if (token) {
        try {
          await firebaseMessaging.send({
            token,
            notification: {
              title: 'EMERGENCY SOS',
              body: `EMERGENCY: ${data.sos_type} reported by truck driver ${distance}km from you. Please help.`,
            },
            android: { priority: 'high' },
          });
        } catch (e) {
          console.error('FCM error', e);
        }
      }
    }
  }

  return {
    sos_id: alert.id,
    notified_count: dispatchedToIds.length,
    emergency_numbers: {
      police: '112',
      ambulance: '108',
      highway_helpline: '1033',
    },
  };
};

export const resolveSosService = async (id: string, driverId: string) => {
  const alert = await sosRepo.getSosById(id);
  if (!alert) {
    throw new AppError({ statusCode: 404, code: 'NOT_FOUND', message: 'SOS alert not found' });
  }

  if (alert.driver_id !== driverId) {
    throw new AppError({
      statusCode: 403,
      code: 'FORBIDDEN',
      message: 'Only the driver can resolve this SOS',
    });
  }

  const updated = await sosRepo.resolveSosAlert(id);

  const dispatchedToIds = updated.dispatched_to as string[];
  await sendFcmMulti(
    dispatchedToIds,
    'Emergency Resolved',
    'Emergency resolved. Thank you for your help.'
  );

  return updated;
};

export const getActiveSosService = async (driverId: string) => {
  return sosRepo.getActiveSos(driverId);
};
