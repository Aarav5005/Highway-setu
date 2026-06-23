import { type Request, type Response, type NextFunction } from 'express';
import { dbPool } from '../../db/pool';

export const getMyCode = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.auth?.userId;

    const userRes = await dbPool.query('SELECT referral_code FROM users WHERE id = $1', [userId]);
    const referralCode = userRes.rows[0]?.referral_code;

    const statsRes = await dbPool.query(
      `SELECT status, COUNT(*) as count FROM referrals WHERE referrer_id = $1 GROUP BY status`,
      [userId]
    );

    let total = 0;
    const breakdown: Record<string, number> = {};
    for (const row of statsRes.rows) {
      const count = parseInt(row.count, 10);
      breakdown[row.status] = count;
      if (row.status === 'completed') total += count;
    }

    res.status(200).json({
      success: true,
      data: {
        referral_code: referralCode,
        total_completed: total,
        breakdown,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMyReferrals = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.auth?.userId;

    const result = await dbPool.query(
      `SELECT r.status, r.created_at, u.phone_e164, p.first_name, p.last_name
       FROM referrals r
       JOIN users u ON r.referred_id = u.id
       LEFT JOIN driver_profiles p ON u.id = p.user_id
       WHERE r.referrer_id = $1
       ORDER BY r.created_at DESC`,
      [userId]
    );

    const data = result.rows.map((r) => ({
      status: r.status,
      created_at: r.created_at,
      name: r.first_name ? `${r.first_name} ${r.last_name || ''}`.trim() : r.phone_e164,
    }));

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
