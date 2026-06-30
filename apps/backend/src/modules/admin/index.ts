import { Router } from 'express';
import { requireAuth } from '../../middleware/require-auth';
import { dbPool } from '../../db/pool';

export const adminRouter = Router();

// Only admin users can access these endpoints
adminRouter.use(requireAuth(['admin']));

adminRouter.get('/users', async (req, res, next) => {
  try {
    const result = await dbPool.query(
      'SELECT id, phone_e164, role, verification_status, language_pref as preferred_language, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

adminRouter.get('/users/:id', async (req, res, next) => {
  try {
    const result = await dbPool.query('SELECT * FROM users WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

adminRouter.post('/users/:id/verify', async (req, res, next) => {
  try {
    await dbPool.query(
      'UPDATE users SET verification_status = $1, updated_at = now() WHERE id = $2',
      ['verified', req.params.id]
    );
    res.json({ success: true, message: 'User verified successfully' });
  } catch (err) {
    next(err);
  }
});

adminRouter.post('/users/:id/reject', async (req, res, next) => {
  try {
    await dbPool.query(
      'UPDATE users SET verification_status = $1, updated_at = now() WHERE id = $2',
      ['rejected', req.params.id]
    );
    res.json({ success: true, message: 'User rejected successfully' });
  } catch (err) {
    next(err);
  }
});

adminRouter.get('/stats', async (req, res, next) => {
  try {
    const usersCount = await dbPool.query('SELECT COUNT(*) FROM users');
    const driversCount = await dbPool.query('SELECT COUNT(*) FROM users WHERE role = $1', [
      'driver',
    ]);
    const dhabasCount = await dbPool.query('SELECT COUNT(*) FROM users WHERE role = $1', [
      'dhaba_owner',
    ]);
    const mechanicsCount = await dbPool.query('SELECT COUNT(*) FROM users WHERE role = $1', [
      'mechanic',
    ]);
    const verifiedCount = await dbPool.query(
      'SELECT COUNT(*) FROM users WHERE verification_status = $1',
      ['verified']
    );
    const pendingCount = await dbPool.query(
      'SELECT COUNT(*) FROM users WHERE verification_status = $1',
      ['pending']
    );

    let ordersToday = 0;
    try {
      const ordersRes = await dbPool.query(
        'SELECT COUNT(*) FROM food_orders WHERE DATE(created_at) = CURRENT_DATE'
      );
      ordersToday = parseInt(ordersRes.rows[0].count);
    } catch {
      // Ignore if table doesn't exist yet
    }

    let activeSos = 0;
    try {
      const sosRes = await dbPool.query('SELECT COUNT(*) FROM sos_alerts WHERE status = $1::sos_status', [
        'active',
      ]);
      activeSos = parseInt(sosRes.rows[0].count);
    } catch {
      // Ignore if table doesn't exist yet
    }

    const registrationsQuery = `
      SELECT 
        to_char(DATE(created_at), 'Dy') as date,
        SUM(CASE WHEN role = 'driver' THEN 1 ELSE 0 END)::int as drivers,
        SUM(CASE WHEN role = 'dhaba_owner' THEN 1 ELSE 0 END)::int as dhabas,
        SUM(CASE WHEN role = 'mechanic' THEN 1 ELSE 0 END)::int as mechanics
      FROM users
      WHERE created_at >= CURRENT_DATE - INTERVAL '6 days'
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at) ASC
    `;
    const registrationsResult = await dbPool.query(registrationsQuery);

    let ordersData = [];
    try {
      const ordersQuery = `
        SELECT 
          to_char(DATE(created_at), 'Dy') as date,
          COUNT(*)::int as orders
        FROM food_orders
        WHERE created_at >= CURRENT_DATE - INTERVAL '6 days'
        GROUP BY DATE(created_at)
        ORDER BY DATE(created_at) ASC
      `;
      const ordersResult = await dbPool.query(ordersQuery);
      ordersData = ordersResult.rows;
    } catch {
      // Ignore
    }

    res.json({
      totalUsers: parseInt(usersCount.rows[0].count),
      verifiedUsers: parseInt(verifiedCount.rows[0].count),
      totalDrivers: parseInt(driversCount.rows[0].count),
      totalDhabas: parseInt(dhabasCount.rows[0].count),
      totalMechanics: parseInt(mechanicsCount.rows[0].count),
      pendingVerifications: parseInt(pendingCount.rows[0].count),
      ordersToday,
      activeSos,
      registrationsData: registrationsResult.rows,
      ordersData,
    });
  } catch (err) {
    next(err);
  }
});
