/* eslint-disable @typescript-eslint/no-explicit-any */
import { AppError } from '../../errors/app-error';
import * as ordersRepo from './repository';
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

export const createOrderService = async (
  driverId: string,
  driverName: string, // From users table eventually or token
  data: { dhaba_id: string; items: any[]; trip_id?: string; eta_minutes?: number }
) => {
  const menuItems = await ordersRepo.getMenuItems(data.dhaba_id);
  const menuMap = new Map(menuItems.map((i) => [i.id, i.price]));

  let totalAmount = 0;
  for (const item of data.items) {
    const price = menuMap.get(item.menu_item_id);
    if (!price) {
      throw new AppError({
        statusCode: 400,
        code: 'INVALID_ITEM',
        message: `Menu item ${item.menu_item_id} not found in dhaba`,
      });
    }
    // Trust client price for now as per instructions or override with server price
    totalAmount += item.price * item.quantity;
  }

  const order = await ordersRepo.createOrder(
    driverId,
    data.dhaba_id,
    data.trip_id,
    data.items,
    totalAmount,
    data.eta_minutes
  );

  // Send FCM to Dhaba Owner
  const dhabaRes = await dbPool.query('SELECT user_id FROM dhaba_profiles WHERE id = $1', [
    data.dhaba_id,
  ]);
  const dhabaOwnerId = dhabaRes.rows[0]?.user_id;
  if (dhabaOwnerId) {
    const etaStr = data.eta_minutes ? `${data.eta_minutes}` : 'unknown';
    await sendFcm(
      dhabaOwnerId,
      'New Order Received',
      `New order arriving in ${etaStr} minutes. Total: ₹${totalAmount}. Cash on delivery.`
    );
  }

  return order;
};

export const getOrderService = async (id: string, userId: string, role: string) => {
  const order = await ordersRepo.getOrderById(id);
  if (!order) {
    throw new AppError({ statusCode: 404, code: 'NOT_FOUND', message: 'Order not found' });
  }

  if (role === 'driver' && order.driver_id !== userId) {
    throw new AppError({ statusCode: 403, code: 'FORBIDDEN', message: 'Access denied' });
  }

  if (role === 'dhaba_owner') {
    const dhabaRes = await dbPool.query('SELECT user_id FROM dhaba_profiles WHERE id = $1', [
      order.dhaba_id,
    ]);
    if (dhabaRes.rows[0]?.user_id !== userId) {
      throw new AppError({ statusCode: 403, code: 'FORBIDDEN', message: 'Access denied' });
    }
  }

  return order;
};

export const acceptOrderService = async (id: string, userId: string, prepTime: number) => {
  const order = await getOrderService(id, userId, 'dhaba_owner');
  const updated = await ordersRepo.updateOrderStatus(id, 'accepted');

  await sendFcm(
    order.driver_id,
    'Order Accepted',
    `Order accepted! Ready in ${prepTime} minutes. Pay ₹${order.total_amount} cash on pickup.`
  );

  return updated;
};

export const rejectOrderService = async (id: string, userId: string, reason: string) => {
  const order = await getOrderService(id, userId, 'dhaba_owner');
  const updated = await ordersRepo.updateOrderStatus(id, 'rejected', undefined, reason);

  await sendFcm(order.driver_id, 'Order Rejected', `Order rejected: ${reason}`);

  return updated;
};

export const updateStatusService = async (id: string, userId: string, status: string) => {
  const order = await getOrderService(id, userId, 'dhaba_owner');
  const paymentStatus = status === 'picked_up' ? 'completed' : undefined;

  const updated = await ordersRepo.updateOrderStatus(id, status, paymentStatus);

  if (status === 'picked_up') {
    await dbPool.query(
      `UPDATE driver_profiles SET loyalty_points = loyalty_points + 10 WHERE user_id = $1`,
      [order.driver_id]
    );

    const dhabaRes = await dbPool.query('SELECT dhaba_name FROM dhaba_profiles WHERE id = $1', [
      order.dhaba_id,
    ]);
    const dhabaName = dhabaRes.rows[0]?.dhaba_name || 'Dhaba';

    await dbPool.query(
      `INSERT INTO loyalty_transactions (user_id, type, points, description, reference_id) VALUES ($1, $2, $3, $4, $5)`,
      [order.driver_id, 'meal', 10, `Meal at ${dhabaName}`, order.id]
    );

    const countRes = await dbPool.query(
      `SELECT COUNT(*) FROM food_orders WHERE driver_id = $1 AND dhaba_id = $2 AND status = 'picked_up'`,
      [order.driver_id, order.dhaba_id]
    );
    const count = parseInt(countRes.rows[0].count, 10);

    if (count > 0 && count % 5 === 0) {
      await sendFcm(
        order.driver_id,
        'Loyalty Reward',
        `🎉 You have eaten ${count} times at ${dhabaName}! Your next meal there is FREE. Show this message at the dhaba.`
      );
    } else {
      await sendFcm(
        order.driver_id,
        'Order Update',
        `Your order status is now: ${status}. You earned 10 loyalty points!`
      );
    }
  } else {
    await sendFcm(order.driver_id, 'Order Update', `Your order status is now: ${status}`);
  }

  return updated;
};

export const getDriverOrdersService = async (driverId: string) => {
  return ordersRepo.getDriverOrders(driverId);
};

export const getDhabaOrdersService = async (userId: string, status?: string) => {
  const dhabaRes = await dbPool.query('SELECT id FROM dhaba_profiles WHERE user_id = $1', [userId]);
  const dhabaId = dhabaRes.rows[0]?.id;
  if (!dhabaId) return [];

  return ordersRepo.getDhabaOrders(dhabaId, status);
};
