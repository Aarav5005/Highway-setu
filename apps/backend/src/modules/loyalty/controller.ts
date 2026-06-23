import { type Request, type Response, type NextFunction } from 'express';
import { dbPool } from '../../db/pool';

export const getMyPoints = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const driverId = req.auth?.userId;

    const profileRes = await dbPool.query(
      'SELECT loyalty_points FROM driver_profiles WHERE user_id = $1',
      [driverId]
    );
    const points = profileRes.rows[0]?.loyalty_points || 0;

    const txRes = await dbPool.query(
      `SELECT * FROM loyalty_transactions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20`,
      [driverId]
    );

    res.status(200).json({
      success: true,
      data: {
        total_points: points,
        history: txRes.rows,
      },
    });
  } catch (error) {
    next(error);
  }
};
