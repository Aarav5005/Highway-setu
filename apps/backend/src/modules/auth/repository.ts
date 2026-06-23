import type { Pool } from 'pg';
import { dbPool } from '../../db/pool';
import type { AuthRepositoryUser, AuthUserResponseDto, ProfileCompletionDto } from './types';
import type { PreferredLanguage, UserRole, VerificationStatus } from '../../auth/auth-types';

type CreateUserInput = {
  phoneE164: string;
  role: UserRole;
  preferredLanguage: PreferredLanguage;
};

export type AuthRepository = {
  findUserByPhone(phoneE164: string): Promise<AuthRepositoryUser | null>;
  findUserById(userId: string): Promise<AuthRepositoryUser | null>;
  createUser(input: CreateUserInput): Promise<AuthRepositoryUser>;
  updateUserRole(userId: string, role: UserRole): Promise<AuthRepositoryUser | null>;
  updatePreferredLanguage(
    userId: string,
    preferredLanguage: PreferredLanguage
  ): Promise<AuthRepositoryUser | null>;
  updateVerificationStatus(
    userId: string,
    verificationStatus: VerificationStatus
  ): Promise<AuthRepositoryUser | null>;
  hasRoleProfile(userId: string, role: UserRole): Promise<boolean>;
};

const toUserRecord = (row: Record<string, unknown>): AuthRepositoryUser => ({
  id: String(row.id),
  firebase_uid: String(row.firebase_uid),
  phone_e164: String(row.phone_e164),
  role: row.role as UserRole,
  verification_status: row.verification_status as VerificationStatus,
  language_pref: row.language_pref as PreferredLanguage,
  created_at: new Date(String(row.created_at)),
  updated_at: new Date(String(row.updated_at)),
});

const rowToAuthUser = (user: AuthRepositoryUser): AuthUserResponseDto => ({
  id: user.id,
  phoneE164: user.phone_e164,
  role: user.role,
  verificationStatus: user.verification_status,
  preferredLanguage: user.language_pref,
});

export const toAuthUserResponse = rowToAuthUser;

export const buildProfileCompletion = async (
  repository: AuthRepository,
  userId: string,
  role: UserRole
): Promise<ProfileCompletionDto> => {
  const hasRoleProfile = await repository.hasRoleProfile(userId, role);

  return {
    roleSelected: true,
    profileComplete: role === 'admin' ? true : hasRoleProfile,
    requiredProfile:
      role === 'driver'
        ? 'driver'
        : role === 'dhaba_owner'
          ? 'dhaba'
          : role === 'mechanic'
            ? 'mechanic'
            : 'none',
  };
};

export const createAuthRepository = (pool: Pool = dbPool): AuthRepository => ({
  async findUserByPhone(phoneE164) {
    const result = await pool.query<Record<string, unknown>>(
      `
        SELECT id, firebase_uid, phone_e164, role, verification_status, language_pref, created_at, updated_at
        FROM users
        WHERE phone_e164 = $1
        LIMIT 1
      `,
      [phoneE164]
    );

    return result.rows[0] ? toUserRecord(result.rows[0]) : null;
  },

  async findUserById(userId) {
    const result = await pool.query<Record<string, unknown>>(
      `
        SELECT id, firebase_uid, phone_e164, role, verification_status, language_pref, created_at, updated_at
        FROM users
        WHERE id = $1
        LIMIT 1
      `,
      [userId]
    );

    return result.rows[0] ? toUserRecord(result.rows[0]) : null;
  },

  async createUser(input) {
    const result = await pool.query<Record<string, unknown>>(
      `
        INSERT INTO users (firebase_uid, phone_e164, role, language_pref)
        VALUES ($1, $2, $3, $4)
        RETURNING id, firebase_uid, phone_e164, role, verification_status, language_pref, created_at, updated_at
      `,
      [`auth:${input.phoneE164}`, input.phoneE164, input.role, input.preferredLanguage]
    );

    const row = result.rows[0];
    if (!row) {
      throw new Error('Failed to create user');
    }

    return toUserRecord(row);
  },

  async updateUserRole(userId, role) {
    const result = await pool.query<Record<string, unknown>>(
      `
        UPDATE users
        SET role = $2, updated_at = now()
        WHERE id = $1
        RETURNING id, firebase_uid, phone_e164, role, verification_status, language_pref, created_at, updated_at
      `,
      [userId, role]
    );

    return result.rows[0] ? toUserRecord(result.rows[0]) : null;
  },

  async updatePreferredLanguage(userId, preferredLanguage) {
    const result = await pool.query<Record<string, unknown>>(
      `
        UPDATE users
        SET language_pref = $2, updated_at = now()
        WHERE id = $1
        RETURNING id, firebase_uid, phone_e164, role, verification_status, language_pref, created_at, updated_at
      `,
      [userId, preferredLanguage]
    );

    return result.rows[0] ? toUserRecord(result.rows[0]) : null;
  },

  async updateVerificationStatus(userId, verificationStatus) {
    const result = await pool.query<Record<string, unknown>>(
      `
        UPDATE users
        SET verification_status = $2, updated_at = now()
        WHERE id = $1
        RETURNING id, firebase_uid, phone_e164, role, verification_status, language_pref, created_at, updated_at
      `,
      [userId, verificationStatus]
    );

    return result.rows[0] ? toUserRecord(result.rows[0]) : null;
  },

  async hasRoleProfile(userId, role) {
    const tableName =
      role === 'driver'
        ? 'driver_profiles'
        : role === 'dhaba_owner'
          ? 'dhaba_profiles'
          : role === 'mechanic'
            ? 'mechanic_profiles'
            : null;

    if (!tableName) {
      return true;
    }

    const result = await pool.query<{ exists: boolean }>(
      `SELECT EXISTS(SELECT 1 FROM ${tableName} WHERE user_id = $1) AS exists`,
      [userId]
    );

    return Boolean(result.rows[0]?.exists);
  },
});
