import { env } from '../config/env';
/* eslint-disable no-undef */

import { AppError } from '../errors/app-error';

const SUPABASE_STORAGE_BASE = `${env.SUPABASE_URL}/storage/v1/object`;

export type StorageUploadInput = {
  bucket: string;
  path: string;
  body: Buffer;
  contentType: string;
};

export const uploadToStorage = async (input: StorageUploadInput): Promise<string> => {
  const serviceKey = env.SUPABASE_SERVICE_KEY;
  if (!serviceKey || !env.SUPABASE_URL) {
    throw new AppError({
      statusCode: 500,
      code: 'STORAGE_NOT_CONFIGURED',
      message: 'Storage provider is not configured',
    });
  }

  const url = `${SUPABASE_STORAGE_BASE}/${input.bucket}/${input.path}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': input.contentType,
      'x-upsert': 'true',
    },
    body: input.body,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new AppError({
      statusCode: 502,
      code: 'STORAGE_UPLOAD_FAILED',
      message: `Storage upload failed: ${errorText}`,
    });
  }

  // Return the public URL for the uploaded object
  return `${env.SUPABASE_URL}/storage/v1/object/public/${input.bucket}/${input.path}`;
};

export const deleteFromStorage = async (bucket: string, path: string): Promise<void> => {
  const serviceKey = env.SUPABASE_SERVICE_KEY;
  if (!serviceKey || !env.SUPABASE_URL) {
    throw new AppError({
      statusCode: 500,
      code: 'STORAGE_NOT_CONFIGURED',
      message: 'Storage provider is not configured',
    });
  }

  const url = `${SUPABASE_STORAGE_BASE}/${bucket}/${path}`;

  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${serviceKey}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new AppError({
      statusCode: 502,
      code: 'STORAGE_DELETE_FAILED',
      message: `Storage delete failed: ${errorText}`,
    });
  }
};
