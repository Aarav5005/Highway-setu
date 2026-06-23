import { Router } from 'express';
import { requireAuth } from '../../middleware/require-auth';
import { dbPool } from '../../db/pool';

export const adminRouter = Router();

// Only admin users can access these endpoints
adminRouter.use(requireAuth(['admin']));

adminRouter.get('/users', async (req, res, next) => {
  try {
    const result = await dbPool.query(
      'SELECT id, phone_e164, role, verification_status, preferred_language, created_at FROM users ORDER BY created_at DESC'
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
    const verifiedCount = await dbPool.query(
      'SELECT COUNT(*) FROM users WHERE verification_status = $1',
      ['verified']
    );
    res.json({
      totalUsers: parseInt(usersCount.rows[0].count),
      verifiedUsers: parseInt(verifiedCount.rows[0].count),
    });
  } catch (err) {
    next(err);
  }
});
