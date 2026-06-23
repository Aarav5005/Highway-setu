import type { PreferredLanguage } from '../../auth/auth-types';

export type DriverProfileRequestDto = {
  fullName: string;
  licenseNumber: string;
  truckRegistrationNumber: string;
  truckType: string;
};

export type DriverTruckRequestDto = {
  truckRegistrationNumber: string;
  truckType: string;
};

export type DriverProfileResponseDto = {
  userId: string;
  fullName: string;
  phoneE164: string;
  licenseNumber: string;
  truckRegistrationNumber: string;
  truckType: string;
  preferredLanguage: PreferredLanguage;
  gpsTrackingEnabled: boolean;
  currentLatitude: number | null;
  currentLongitude: number | null;
  lastLocationAt: string | null;
};

export type DriverTruckResponseDto = {
  truckRegistrationNumber: string;
  truckType: string;
  updatedAt: string;
};

export type DriverProfileCompletionDto = {
  isComplete: boolean;
  missingFields: Array<'fullName' | 'licenseNumber' | 'truckRegistrationNumber' | 'truckType'>;
  preferredLanguage: PreferredLanguage;
};

export type DriverProfileViewDto = {
  profile: DriverProfileResponseDto;
  profileCompletion: DriverProfileCompletionDto;
};
