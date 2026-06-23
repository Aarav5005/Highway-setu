import assert from 'node:assert/strict';
import test, { before } from 'node:test';
import type { AuthRepository } from '../src/modules/auth/repository';

process.env.APP_ENV = process.env.APP_ENV ?? 'test';
process.env.APP_PORT = process.env.APP_PORT ?? '3000';
process.env.APP_BASE_URL = process.env.APP_BASE_URL ?? 'http://localhost:3000';
process.env.DB_HOST = process.env.DB_HOST ?? 'localhost';
process.env.DB_PORT = process.env.DB_PORT ?? '5432';
process.env.DB_NAME = process.env.DB_NAME ?? 'test';
process.env.DB_USER = process.env.DB_USER ?? 'test';
process.env.DB_PASSWORD = process.env.DB_PASSWORD ?? 'test';
process.env.DB_SSL = process.env.DB_SSL ?? 'false';
process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET ?? 'test-access-secret-123456';
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET ?? 'test-refresh-secret-123456';
process.env.JWT_ACCESS_TTL = process.env.JWT_ACCESS_TTL ?? '15m';
process.env.JWT_REFRESH_TTL = process.env.JWT_REFRESH_TTL ?? '7d';
process.env.FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID ?? 'test-project';
process.env.FIREBASE_CLIENT_EMAIL = process.env.FIREBASE_CLIENT_EMAIL ?? 'test@example.com';
process.env.FIREBASE_PRIVATE_KEY = process.env.FIREBASE_PRIVATE_KEY ?? 'test-private-key';
process.env.GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY ?? 'test-google-maps-key';
process.env.STORAGE_PROVIDER = process.env.STORAGE_PROVIDER ?? 's3';
process.env.STORAGE_BUCKET = process.env.STORAGE_BUCKET ?? 'test-bucket';
process.env.STORAGE_REGION = process.env.STORAGE_REGION ?? 'ap-south-1';
process.env.CORS_ALLOWED_ORIGINS = process.env.CORS_ALLOWED_ORIGINS ?? 'http://localhost:3000';
process.env.LOG_LEVEL = process.env.LOG_LEVEL ?? 'info';

let createAuthSessionStore: typeof import('../src/modules/auth/session-store').createAuthSessionStore;
let createAuthService: typeof import('../src/modules/auth/service').createAuthService;

before(async () => {
  const sessionStoreModule = await import('../src/modules/auth/session-store');
  const serviceModule = await import('../src/modules/auth/service');
  createAuthSessionStore = sessionStoreModule.createAuthSessionStore;
  createAuthService = serviceModule.createAuthService;
});

const createInMemoryRepository = () => {
  const state = {
    users: new Map<string, any>(),
    phoneIndex: new Map<string, string>(),
    roleProfiles: new Set<string>(),
  };

  const repository: AuthRepository = {
    async findUserByPhone(phoneE164) {
      const userId = state.phoneIndex.get(phoneE164);
      return userId ? (state.users.get(userId) ?? null) : null;
    },
    async findUserById(userId) {
      return state.users.get(userId) ?? null;
    },
    async createUser(input) {
      const user = {
        id: `user-${state.users.size + 1}`,
        firebase_uid: `auth:${input.phoneE164}`,
        phone_e164: input.phoneE164,
        role: input.role,
        verification_status: 'pending',
        preferred_language: input.preferredLanguage,
        created_at: new Date('2026-01-01T00:00:00.000Z'),
        updated_at: new Date('2026-01-01T00:00:00.000Z'),
      };

      state.users.set(user.id, user);
      state.phoneIndex.set(user.phone_e164, user.id);
      return user;
    },
    async updateUserRole(userId, role) {
      const user = state.users.get(userId);
      if (!user) {
        return null;
      }
      user.role = role;
      return user;
    },
    async updatePreferredLanguage(userId, preferredLanguage) {
      const user = state.users.get(userId);
      if (!user) {
        return null;
      }
      user.preferred_language = preferredLanguage;
      return user;
    },
    async updateVerificationStatus(userId, verificationStatus) {
      const user = state.users.get(userId);
      if (!user) {
        return null;
      }
      user.verification_status = verificationStatus;
      return user;
    },
    async hasRoleProfile(userId) {
      return state.roleProfiles.has(userId);
    },
  };

  return { repository, state };
};

test('sendOtp returns a verification token and enforces cooldown', async () => {
  const { repository } = createInMemoryRepository();
  const service = createAuthService({
    repository,
    sessionStore: createAuthSessionStore(),
    clock: () => 0,
  });

  const first = await service.sendOtp('+919876543210');
  assert.equal(typeof first.verificationToken, 'string');
  assert.equal(typeof first.otpCode, 'string');

  await assert.rejects(
    () => service.sendOtp('+919876543210'),
    (error: any) => error.code === 'AUTH_OTP_RATE_LIMITED'
  );
});

test('verifyOtp creates a user, issues tokens, and supports role selection', async () => {
  const { repository } = createInMemoryRepository();
  const sessionStore = createAuthSessionStore();
  const service = createAuthService({ repository, sessionStore, clock: () => 0 });

  const challenge = await service.sendOtp('+919876543211');
  const verified = await service.verifyOtp({
    phoneE164: '+919876543211',
    otpCode: challenge.otpCode,
    verificationToken: challenge.verificationToken,
    preferredLanguage: 'hindi',
  });

  assert.equal(verified.tokenType, 'Bearer');
  assert.equal(verified.user.phoneE164, '+919876543211');
  assert.equal(verified.user.preferredLanguage, 'hindi');

  const selectedRole = await service.selectRole({
    userId: verified.user.id,
    role: 'mechanic_owner',
  });
  assert.equal(selectedRole.role, 'mechanic_owner');
});

test('refresh and logout respect refresh-token state', async () => {
  const { repository } = createInMemoryRepository();
  const sessionStore = createAuthSessionStore();
  const service = createAuthService({ repository, sessionStore, clock: () => 0 });

  const challenge = await service.sendOtp('+919876543212');
  const verified = await service.verifyOtp({
    phoneE164: '+919876543212',
    otpCode: challenge.otpCode,
    verificationToken: challenge.verificationToken,
  });

  const refreshed = await service.refreshAccessToken(verified.refreshToken);
  assert.equal(refreshed.tokenType, 'Bearer');

  const logout = await service.logout({
    accessUserId: verified.user.id,
    refreshToken: verified.refreshToken,
  });
  assert.equal(logout.success, true);

  await assert.rejects(
    () => service.refreshAccessToken(verified.refreshToken),
    (error: any) => error.code === 'AUTH_INVALID_REFRESH_TOKEN'
  );
});

test('getAuthContext returns profile completion', async () => {
  const { repository } = createInMemoryRepository();
  const sessionStore = createAuthSessionStore();
  const service = createAuthService({ repository, sessionStore, clock: () => 0 });

  const challenge = await service.sendOtp('+919876543213');
  const verified = await service.verifyOtp({
    phoneE164: '+919876543213',
    otpCode: challenge.otpCode,
    verificationToken: challenge.verificationToken,
  });

  const authContext = await service.getAuthContext(verified.user.id);
  assert.equal(authContext.user.id, verified.user.id);
  assert.equal(authContext.profileCompletion.roleSelected, true);
  assert.equal(authContext.profileCompletion.profileComplete, false);
});
