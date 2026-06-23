import { dbPool } from '../../db/pool';
import type { PreferredLanguage } from '../../auth/auth-types';
import type {
  DriverProfileResponseDto,
  DriverTruckResponseDto,
  DriverProfileCompletionDto,
} from './types';

export type DriverProfileRecord = {
  userId: string;
  phoneE164: string;
  preferredLanguage: PreferredLanguage;
  fullName: string;
  licenseNumber: string;
  truckRegistrationNumber: string;
  truckType: string;
  gpsTrackingEnabled: boolean;
  currentLatitude: number | null;
  currentLongitude: number | null;
  lastLocationAt: Date | null;
  updatedAt: Date;
};

export type DriverProfileRepository = {
  findByUserId(userId: string): Promise<DriverProfileRecord | null>;
  hasLicenseConflict(userId: string, licenseNumber: string): Promise<boolean>;
  hasTruckRegistrationConflict(userId: string, truckRegistrationNumber: string): Promise<boolean>;
  upsertProfile(input: {
    userId: string;
    fullName: string;
    licenseNumber: string;
    truckRegistrationNumber: string;
    truckType: string;
  }): Promise<DriverProfileRecord>;
  updateTruck(input: {
    userId: string;
    truckRegistrationNumber: string;
    truckType: string;
  }): Promise<DriverProfileRecord | null>;
};

const toProfileRecord = (row: Record<string, unknown>): DriverProfileRecord => ({
  userId: String(row.user_id),
  phoneE164: String(row.phone_e164),
  preferredLanguage: row.preferred_language as PreferredLanguage,
  fullName: String(row.full_name),
  licenseNumber: String(row.license_number),
  truckRegistrationNumber: String(row.truck_registration_number),
  truckType: String(row.truck_type),
  gpsTrackingEnabled: Boolean(row.gps_tracking_enabled),
  currentLatitude:
    row.current_latitude === null || row.current_latitude === undefined
      ? null
      : Number(row.current_latitude),
  currentLongitude:
    row.current_longitude === null || row.current_longitude === undefined
      ? null
      : Number(row.current_longitude),
  lastLocationAt:
    row.last_location_at === null || row.last_location_at === undefined
      ? null
      : new Date(String(row.last_location_at)),
  updatedAt: new Date(String(row.updated_at)),
});

const mapDriverProfile = (record: DriverProfileRecord): DriverProfileResponseDto => ({
  userId: record.userId,
  fullName: record.fullName,
  phoneE164: record.phoneE164,
  licenseNumber: record.licenseNumber,
  truckRegistrationNumber: record.truckRegistrationNumber,
  truckType: record.truckType,
  preferredLanguage: record.preferredLanguage,
  gpsTrackingEnabled: record.gpsTrackingEnabled,
  currentLatitude: record.currentLatitude,
  currentLongitude: record.currentLongitude,
  lastLocationAt: record.lastLocationAt ? record.lastLocationAt.toISOString() : null,
});

const mapTruckResponse = (record: DriverProfileRecord): DriverTruckResponseDto => ({
  truckRegistrationNumber: record.truckRegistrationNumber,
  truckType: record.truckType,
  updatedAt: record.updatedAt.toISOString(),
});

export const buildDriverProfileCompletion = (
  record: DriverProfileRecord | null
): DriverProfileCompletionDto => {
  const preferredLanguage = record?.preferredLanguage ?? 'english';
  const missingFields: DriverProfileCompletionDto['missingFields'] = [];

  if (!record || record.fullName.trim().length === 0) {
    missingFields.push('fullName');
  }

  if (!record || record.licenseNumber.trim().length === 0) {
    missingFields.push('licenseNumber');
  }

  if (!record || record.truckRegistrationNumber.trim().length === 0) {
    missingFields.push('truckRegistrationNumber');
  }

  if (!record || record.truckType.trim().length === 0) {
    missingFields.push('truckType');
  }

  return {
    isComplete: missingFields.length === 0,
    missingFields,
    preferredLanguage,
  };
};

export const createDriverProfileRepository = (): DriverProfileRepository => ({
  async findByUserId(userId) {
    const result = await dbPool.query<Record<string, unknown>>(
      `
        SELECT
          dp.user_id,
          u.phone_e164,
          u.preferred_language,
          dp.full_name,
          dp.license_number,
          dp.truck_registration_number,
          dp.truck_type,
          dp.gps_tracking_enabled,
          dp.current_latitude,
          dp.current_longitude,
          dp.last_location_at,
          dp.updated_at
        FROM driver_profiles dp
        INNER JOIN users u ON u.id = dp.user_id
        WHERE dp.user_id = $1
        LIMIT 1
      `,
      [userId]
    );

    return result.rows[0] ? toProfileRecord(result.rows[0]) : null;
  },

  async hasLicenseConflict(userId, licenseNumber) {
    const result = await dbPool.query<{ exists: boolean }>(
      `
        SELECT EXISTS(
          SELECT 1
          FROM driver_profiles
          WHERE license_number = $2
            AND user_id <> $1
        ) AS exists
      `,
      [userId, licenseNumber.trim()]
    );

    return Boolean(result.rows[0]?.exists);
  },

  async hasTruckRegistrationConflict(userId, truckRegistrationNumber) {
    const result = await dbPool.query<{ exists: boolean }>(
      `
        SELECT EXISTS(
          SELECT 1
          FROM driver_profiles
          WHERE truck_registration_number = $2
            AND user_id <> $1
        ) AS exists
      `,
      [userId, truckRegistrationNumber.trim().toUpperCase()]
    );

    return Boolean(result.rows[0]?.exists);
  },

  async upsertProfile(input) {
    await dbPool.query<Record<string, unknown>>(
      `
        INSERT INTO driver_profiles (
          user_id,
          full_name,
          license_number,
          truck_registration_number,
          truck_type
        )
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (user_id)
        DO UPDATE SET
          full_name = EXCLUDED.full_name,
          license_number = EXCLUDED.license_number,
          truck_registration_number = EXCLUDED.truck_registration_number,
          truck_type = EXCLUDED.truck_type,
          updated_at = now()
        RETURNING
          user_id,
          full_name,
          license_number,
          truck_registration_number,
          truck_type,
          gps_tracking_enabled,
          current_latitude,
          current_longitude,
          last_location_at,
          updated_at
      `,
      [
        input.userId,
        input.fullName.trim(),
        input.licenseNumber.trim(),
        input.truckRegistrationNumber.trim().toUpperCase(),
        input.truckType.trim(),
      ]
    );

    const record = await this.findByUserId(input.userId);
    if (!record) {
      throw new Error('Failed to load driver profile after upsert');
    }

    return record;
  },

  async updateTruck(input) {
    const result = await dbPool.query<Record<string, unknown>>(
      `
        UPDATE driver_profiles
        SET
          truck_registration_number = $2,
          truck_type = $3,
          updated_at = now()
        WHERE user_id = $1
        RETURNING
          user_id,
          full_name,
          license_number,
          truck_registration_number,
          truck_type,
          gps_tracking_enabled,
          current_latitude,
          current_longitude,
          last_location_at,
          updated_at
      `,
      [input.userId, input.truckRegistrationNumber.trim().toUpperCase(), input.truckType.trim()]
    );

    return result.rows[0] ? toProfileRecord(result.rows[0]) : null;
  },
});

export const toDriverProfileResponse = mapDriverProfile;
export const toDriverTruckResponse = mapTruckResponse;
