import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { env } from '../config/env';

export const s3Client = new S3Client({
  region: env.AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY || '',
  },
});

export type S3UploadInput = {
  bucket: string;
  key: string;
  body: Buffer;
  contentType: string;
};

export const uploadToS3 = async (input: S3UploadInput): Promise<string> => {
  const command = new PutObjectCommand({
    Bucket: input.bucket,
    Key: input.key,
    Body: input.body,
    ContentType: input.contentType,
  });

  await s3Client.send(command);

  return `https://${input.bucket}.s3.${env.AWS_REGION}.amazonaws.com/${input.key}`;
};
