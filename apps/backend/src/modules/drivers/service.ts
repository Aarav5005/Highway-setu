import { AppError } from '../../errors/app-error';
import type {
  DriverProfileCompletionDto,
  DriverProfileRequestDto,
  DriverProfileViewDto,
  DriverTruckRequestDto,
  DriverTruckResponseDto,
} from './types';
import {
  buildDriverProfileCompletion,
  toDriverProfileResponse,
  toDriverTruckResponse,
} from './repository';
import type { DriverProfileRepository, DriverProfileRecord } from './repository';

export type DriverProfileService = {
  getDriverProfile(userId: string): Promise<DriverProfileViewDto>;
  upsertDriverProfile(
    userId: string,
    input: DriverProfileRequestDto
  ): Promise<DriverProfileViewDto>;
  updateDriverTruck(userId: string, input: DriverTruckRequestDto): Promise<DriverTruckResponseDto>;
  getProfileCompletion(userId: string): Promise<DriverProfileCompletionDto>;
};

const buildView = (record: DriverProfileRecord): DriverProfileViewDto => ({
  profile: toDriverProfileResponse(record),
  profileCompletion: buildDriverProfileCompletion(record),
});

const normalizeName = (value: string) => value.trim();
const normalizeLicense = (value: string) => value.trim().toUpperCase();

export const createDriverProfileService = (
  repository: DriverProfileRepository
): DriverProfileService => ({
  async getDriverProfile(userId) {
    const record = await repository.findByUserId(userId);

    if (!record) {
      throw new AppError({
        statusCode: 404,
        code: 'DRIVER_PROFILE_NOT_FOUND',
        message: 'Driver profile not found',
      });
    }

    return buildView(record);
  },

  async upsertDriverProfile(userId, input) {
    const fullName = normalizeName(input.fullName);
    const licenseNumber = normalizeLicense(input.licenseNumber);
    const truckRegistrationNumber = input.truckRegistrationNumber.trim().toUpperCase();
    const truckType = input.truckType.trim();

    const licenseConflict = await repository.hasLicenseConflict(userId, licenseNumber);
    if (licenseConflict) {
      throw new AppError({
        statusCode: 409,
        code: 'DRIVER_LICENSE_CONFLICT',
        message: 'Driving license number already exists',
      });
    }

    const truckConflict = await repository.hasTruckRegistrationConflict(
      userId,
      truckRegistrationNumber
    );
    if (truckConflict) {
      throw new AppError({
        statusCode: 409,
        code: 'DRIVER_TRUCK_REG_EXISTS',
        message: 'Truck registration number already exists',
      });
    }

    const record = await repository.upsertProfile({
      userId,
      fullName,
      licenseNumber,
      truckRegistrationNumber,
      truckType,
    });

    return buildView(record);
  },

  async updateDriverTruck(userId, input) {
    const truckRegistrationNumber = input.truckRegistrationNumber.trim().toUpperCase();
    const truckType = input.truckType.trim();

    const conflict = await repository.hasTruckRegistrationConflict(userId, truckRegistrationNumber);
    if (conflict) {
      throw new AppError({
        statusCode: 409,
        code: 'DRIVER_TRUCK_REG_EXISTS',
        message: 'Truck registration number already exists',
      });
    }

    const record = await repository.updateTruck({
      userId,
      truckRegistrationNumber,
      truckType,
    });

    if (!record) {
      throw new AppError({
        statusCode: 404,
        code: 'DRIVER_PROFILE_NOT_FOUND',
        message: 'Driver profile not found',
      });
    }

    return toDriverTruckResponse(record);
  },

  async getProfileCompletion(userId) {
    const record = await repository.findByUserId(userId);
    return buildDriverProfileCompletion(record);
  },
});
