import { Router } from 'express';
import multer from 'multer';
import { requireAuth } from '../../middleware/require-auth';
import { uploadToStorage } from '../../integrations/storage';
import { uploadToS3 } from '../../integrations/s3';
import { env } from '../../config/env';
import { AppError } from '../../errors/app-error';
import { randomUUID } from 'crypto';

const upload = multer({ storage: multer.memoryStorage() });

export const mediaRouter = Router();

mediaRouter.post('/upload', requireAuth(), upload.single('file'), async (req, res, next) => {
  try {
    const file = req.file;
    if (!file)
      throw new AppError({ statusCode: 400, code: 'BAD_REQUEST', message: 'No file provided' });

    const key = `uploads/${randomUUID()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    let url = '';

    if (env.STORAGE_PROVIDER === 'supabase') {
      url = await uploadToStorage({
        bucket: env.STORAGE_BUCKET,
        path: key,
        body: file.buffer,
        contentType: file.mimetype,
      });
    } else {
      url = await uploadToS3({
        bucket: env.AWS_BUCKET_NAME || env.STORAGE_BUCKET,
        key: key,
        body: file.buffer,
        contentType: file.mimetype,
      });
    }

    res.status(200).json({ url });
  } catch (err) {
    next(err);
  }
});
