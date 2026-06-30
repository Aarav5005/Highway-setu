import multer from 'multer';
import { AppError } from '../errors/app-error';

const storage = multer.memoryStorage();

// eslint-disable-next-line @typescript-eslint/no-explicit-any, no-undef
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(
      new AppError({
        statusCode: 400,
        code: 'INVALID_FILE_TYPE',
        message: 'Only image/jpeg and image/png are allowed',
      })
    );
  }
};

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter,
});
