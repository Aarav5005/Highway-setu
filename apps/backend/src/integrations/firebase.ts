/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getMessaging } from 'firebase-admin/messaging';
import { env } from '../config/env';
import { AppError } from '../errors/app-error';

const initFirebase = (): App => {
  const apps = getApps();
  if (apps.length > 0) {
    return apps[0]!;
  }

  return initializeApp({
    credential: cert({
      projectId: env.FIREBASE_PROJECT_ID,
      clientEmail: env.FIREBASE_CLIENT_EMAIL,
      privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });
};

export const firebaseApp = initFirebase();
export const firebaseAuth = getAuth(firebaseApp);
export const firebaseMessaging = getMessaging(firebaseApp);

export const sendFirebaseOtp = async (phoneE164: string): Promise<string> => {
  if (!env.FIREBASE_WEB_API_KEY) {
    throw new AppError({
      statusCode: 500,
      code: 'FIREBASE_ERROR',
      message: 'FIREBASE_WEB_API_KEY is not configured',
    });
  }
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:sendVerificationCode?key=${env.FIREBASE_WEB_API_KEY}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phoneNumber: phoneE164 }),
  });
  const data = (await res.json()) as any;
  if (!res.ok) {
    throw new AppError({
      statusCode: 400,
      code: 'FIREBASE_OTP_FAILED',
      message: data.error?.message || 'Failed to send OTP',
    });
  }
  return data.sessionInfo; // This is the verification token
};

export const verifyFirebaseOtp = async (sessionInfo: string, code: string): Promise<string> => {
  if (!env.FIREBASE_WEB_API_KEY) {
    throw new AppError({
      statusCode: 500,
      code: 'FIREBASE_ERROR',
      message: 'FIREBASE_WEB_API_KEY is not configured',
    });
  }
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPhoneNumber?key=${env.FIREBASE_WEB_API_KEY}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionInfo, code }),
  });
  const data = (await res.json()) as any;
  if (!res.ok) {
    throw new AppError({
      statusCode: 400,
      code: 'AUTH_INVALID_OTP',
      message: data.error?.message || 'Invalid OTP',
    });
  }
  return data.phoneNumber;
};
