import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../../middleware/require-auth';
import { validateRequest } from '../../middleware/validate-request';
import { dbPool } from '../../db/pool';
import { AppError } from '../../errors/app-error';

export const usersRouter = Router();

usersRouter.get('/me', requireAuth(), async (req, res, next) => {
  try {
    const result = await dbPool.query(
      'SELECT id, phone_e164, role, verification_status, language_pref, fcm_token, created_at, updated_at FROM users WHERE id = $1',
      [req.auth!.userId]
    );
    if (result.rows.length === 0) {
      throw new AppError({ statusCode: 404, code: 'NOT_FOUND', message: 'User not found' });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

usersRouter.put(
  '/language',
  requireAuth(),
  validateRequest({
    body: z.object({
      language: z.enum(['english', 'hindi', 'punjabi']),
    }),
  }),
  async (req, res, next) => {
    try {
      await dbPool.query(
        'UPDATE users SET language_pref = $1, updated_at = now() WHERE id = $2',
        [req.body.language, req.auth!.userId]
      );
      res.status(200).json({ success: true });
    } catch (err) {
      next(err);
    }
  }
);

usersRouter.put(
  '/fcm-token',
  requireAuth(),
  validateRequest({
    body: z.object({
      fcmToken: z.string().min(1),
    }),
  }),
  async (req, res, next) => {
    try {
      await dbPool.query('UPDATE users SET fcm_token = $1, updated_at = now() WHERE id = $2', [
        req.body.fcmToken,
        req.auth!.userId,
      ]);
      res.status(200).json({ success: true });
    } catch (err) {
      next(err);
    }
  }
);
