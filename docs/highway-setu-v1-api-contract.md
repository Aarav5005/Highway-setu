# Highway Setu V1 API Contract

## Scope and Rules

This contract includes only the allowed modules requested:

1. Authentication
2. Users
3. Driver Profiles
4. Dhaba Profiles
5. Mechanic Profiles
6. Vendor Discovery
7. Reviews

Global rules applied:

1. Every endpoint maps to at least one V1 screen flow.
2. No future endpoints.
3. No payments endpoints.
4. No SOS endpoints.
5. No ordering endpoints.
6. No loyalty endpoints.
7. No referral endpoints.

Base URL: `/api/v1`

Auth model:

1. Public endpoints: no bearer token.
2. User endpoints: bearer JWT.
3. Admin endpoints: bearer JWT with `role=admin`.

Standard error envelope:

1. `code` string
2. `message` string
3. `details` object or null
4. `requestId` string

## 1) API Inventory

| Module | Endpoint | Method | Consuming Screen(s) |
|---|---|---|---|
| Authentication | /auth/send-otp | POST | OTP Login |
| Authentication | /auth/verify-otp | POST | OTP Login |
| Authentication | /auth/logout | POST | Profile, Settings |
| Authentication | /auth/me | GET | App Bootstrap, Role Routing |
| Users | /users/me | GET | Driver Profile, Dhaba Profile, Mechanic Profile |
| Users | /users/me/language | PATCH | Language Selection |
| Users | /admin/users | GET | Admin User Verification |
| Users | /admin/users/{userId}/verification | PATCH | Admin User Verification |
| Driver Profiles | /driver-profile/me | GET | Driver Profile |
| Driver Profiles | /driver-profile/me | PUT | Driver Profile |
| Driver Profiles | /driver-profile/me/truck | PATCH | Truck Details |
| Driver Profiles | /driver-profile/me/journey/start | POST | Start Journey |
| Driver Profiles | /driver-profile/me/gps | PATCH | GPS Tracking |
| Dhaba Profiles | /dhaba-profile/me | POST | Dhaba Registration |
| Dhaba Profiles | /dhaba-profile/me | GET | Dhaba Profile |
| Dhaba Profiles | /dhaba-profile/me | PUT | Dhaba Profile |
| Dhaba Profiles | /dhaba-profile/me/amenities | PUT | Dhaba Amenities |
| Dhaba Profiles | /dhaba-profile/me/photos | POST | Dhaba Photos |
| Dhaba Profiles | /dhaba-profile/me/photos/{photoId} | DELETE | Dhaba Photos |
| Dhaba Profiles | /dhaba-profile/me/menu-items | PUT | Dhaba Menu |
| Mechanic Profiles | /mechanic-profile/me | POST | Mechanic Registration |
| Mechanic Profiles | /mechanic-profile/me | GET | Mechanic Profile |
| Mechanic Profiles | /mechanic-profile/me | PUT | Mechanic Profile |
| Mechanic Profiles | /mechanic-profile/me/services | PUT | Mechanic Services |
| Mechanic Profiles | /mechanic-profile/me/availability | PATCH | Mechanic Availability |
| Vendor Discovery | /vendors/discovery | GET | Vendor Discovery |
| Vendor Discovery | /vendors/{vendorUserId} | GET | Vendor Details |
| Vendor Discovery | /vendors/{vendorUserId}/distance | GET | Vendor Details |
| Reviews | /vendors/{vendorUserId}/reviews | GET | Vendor Details |
| Reviews | /reviews | POST | Vendor Details |

No endpoint in this inventory is unconsumed.

## 2) Endpoint Contracts

### Authentication

#### POST /api/v1/auth/send-otp

1. Authentication Required: No
2. Request Schema:
   1. `phoneE164` string, required
3. Response Schema (200):
   1. `verificationToken` string
   2. `expiresInSec` integer
4. Validation Rules:
   1. `phoneE164` must match E.164 format.
5. Error Responses:
   1. 400 `AUTH_INVALID_PHONE`
   2. 429 `AUTH_OTP_RATE_LIMITED`
   3. 500 `AUTH_OTP_PROVIDER_ERROR`
6. Permission Rules:
   1. Public endpoint.

#### POST /api/v1/auth/verify-otp

1. Authentication Required: No
2. Request Schema:
   1. `phoneE164` string, required
   2. `otpCode` string, required
   3. `verificationToken` string, required
3. Response Schema (200):
   1. `accessToken` string
   2. `refreshToken` string
   3. `user` object
      1. `id` uuid
      2. `role` enum driver|dhaba_owner|mechanic_owner|admin
      3. `verificationStatus` enum pending|verified|rejected
      4. `preferredLanguage` enum english|hindi|punjabi
4. Validation Rules:
   1. OTP length must be 4 to 8 characters numeric.
   2. `verificationToken` must be active and not expired.
5. Error Responses:
   1. 400 `AUTH_INVALID_OTP`
   2. 401 `AUTH_OTP_EXPIRED`
   3. 409 `AUTH_PHONE_MISMATCH`
   4. 500 `AUTH_LOGIN_FAILED`
6. Permission Rules:
   1. Public endpoint.

#### POST /api/v1/auth/logout

1. Authentication Required: Yes (Any authenticated role)
2. Request Schema:
   1. `refreshToken` string, required
3. Response Schema (200):
   1. `success` boolean
4. Validation Rules:
   1. Refresh token must belong to authenticated subject.
5. Error Responses:
   1. 401 `AUTH_UNAUTHORIZED`
   2. 400 `AUTH_INVALID_REFRESH_TOKEN`
6. Permission Rules:
   1. Authenticated users only.

#### GET /api/v1/auth/me

1. Authentication Required: Yes
2. Request Schema: None
3. Response Schema (200):
   1. `user` object
   2. `profileCompletion` object
4. Validation Rules:
   1. JWT must be valid and active.
5. Error Responses:
   1. 401 `AUTH_UNAUTHORIZED`
6. Permission Rules:
   1. Authenticated users only.

### Users

#### GET /api/v1/users/me

1. Authentication Required: Yes
2. Request Schema: None
3. Response Schema (200):
   1. `id` uuid
   2. `phoneE164` string
   3. `role` string
   4. `verificationStatus` string
   5. `preferredLanguage` string
4. Validation Rules:
   1. JWT subject must match returned user.
5. Error Responses:
   1. 401 `AUTH_UNAUTHORIZED`
6. Permission Rules:
   1. Authenticated users only.

#### PATCH /api/v1/users/me/language

1. Authentication Required: Yes
2. Request Schema:
   1. `preferredLanguage` enum english|hindi|punjabi
3. Response Schema (200):
   1. `preferredLanguage` enum
4. Validation Rules:
   1. Language must be one of supported languages.
5. Error Responses:
   1. 400 `USER_INVALID_LANGUAGE`
   2. 401 `AUTH_UNAUTHORIZED`
6. Permission Rules:
   1. Authenticated users only.

#### GET /api/v1/admin/users

1. Authentication Required: Yes (Admin)
2. Request Schema (Query):
   1. `role` optional enum
   2. `verificationStatus` optional enum
   3. `page` integer >= 1
   4. `limit` integer 1..100
3. Response Schema (200):
   1. `items` array of user summary
   2. `pagination` object
4. Validation Rules:
   1. Limit max 100.
5. Error Responses:
   1. 401 `AUTH_UNAUTHORIZED`
   2. 403 `AUTH_FORBIDDEN`
6. Permission Rules:
   1. `role=admin` required.

#### PATCH /api/v1/admin/users/{userId}/verification

1. Authentication Required: Yes (Admin)
2. Request Schema:
   1. `verificationStatus` enum verified|rejected
3. Response Schema (200):
   1. `userId` uuid
   2. `verificationStatus` enum
   3. `updatedAt` datetime
4. Validation Rules:
   1. `userId` must be UUID.
   2. Cannot set admin user to rejected through this endpoint.
5. Error Responses:
   1. 400 `USER_INVALID_VERIFICATION_STATE`
   2. 404 `USER_NOT_FOUND`
   3. 403 `AUTH_FORBIDDEN`
6. Permission Rules:
   1. `role=admin` required.

### Driver Profiles

#### GET /api/v1/driver-profile/me

1. Authentication Required: Yes (Driver)
2. Request Schema: None
3. Response Schema (200):
   1. `fullName` string
   2. `licenseNumber` string
   3. `truckRegistrationNumber` string
   4. `truckType` string
   5. `gpsTrackingEnabled` boolean
   6. `currentLatitude` number|null
   7. `currentLongitude` number|null
   8. `lastLocationAt` datetime|null
4. Validation Rules:
   1. JWT role must be driver.
5. Error Responses:
   1. 401 `AUTH_UNAUTHORIZED`
   2. 403 `AUTH_FORBIDDEN`
   3. 404 `DRIVER_PROFILE_NOT_FOUND`
6. Permission Rules:
   1. `role=driver` required.

#### PUT /api/v1/driver-profile/me

1. Authentication Required: Yes (Driver)
2. Request Schema:
   1. `fullName` string required
   2. `licenseNumber` string required
3. Response Schema (200):
   1. Updated driver profile summary
4. Validation Rules:
   1. Non-empty full name.
   2. License number length 5..40.
5. Error Responses:
   1. 400 `DRIVER_INVALID_PROFILE`
   2. 409 `DRIVER_LICENSE_CONFLICT`
6. Permission Rules:
   1. `role=driver` required.

#### PATCH /api/v1/driver-profile/me/truck

1. Authentication Required: Yes (Driver)
2. Request Schema:
   1. `truckRegistrationNumber` string required
   2. `truckType` string required
3. Response Schema (200):
   1. `truckRegistrationNumber` string
   2. `truckType` string
4. Validation Rules:
   1. Registration number normalized uppercase.
   2. Unique constraint on registration number.
5. Error Responses:
   1. 400 `DRIVER_INVALID_TRUCK`
   2. 409 `DRIVER_TRUCK_REG_EXISTS`
6. Permission Rules:
   1. `role=driver` required.

#### POST /api/v1/driver-profile/me/journey/start

1. Authentication Required: Yes (Driver)
2. Request Schema:
   1. `startLatitude` number required
   2. `startLongitude` number required
3. Response Schema (200):
   1. `gpsTrackingEnabled` boolean true
   2. `lastLocationAt` datetime
4. Validation Rules:
   1. Latitude between -90 and 90.
   2. Longitude between -180 and 180.
5. Error Responses:
   1. 400 `DRIVER_INVALID_COORDINATES`
6. Permission Rules:
   1. `role=driver` required.

#### PATCH /api/v1/driver-profile/me/gps

1. Authentication Required: Yes (Driver)
2. Request Schema:
   1. `currentLatitude` number required
   2. `currentLongitude` number required
   3. `capturedAt` datetime required
3. Response Schema (200):
   1. `accepted` boolean
   2. `lastLocationAt` datetime
4. Validation Rules:
   1. Coordinate bounds check.
   2. `capturedAt` cannot be older than 10 minutes from server time.
5. Error Responses:
   1. 400 `DRIVER_INVALID_GPS_PAYLOAD`
   2. 409 `DRIVER_GPS_STALE`
6. Permission Rules:
   1. `role=driver` required.

### Dhaba Profiles

#### POST /api/v1/dhaba-profile/me

1. Authentication Required: Yes (Dhaba Owner)
2. Request Schema:
   1. `businessName` string
   2. `phoneE164` string
   3. `addressLine` string
   4. `state` string
   5. `district` string
   6. `pincode` string
   7. `latitude` number
   8. `longitude` number
3. Response Schema (201):
   1. `userId` uuid
   2. `isActive` boolean
4. Validation Rules:
   1. Owner role must be dhaba_owner.
   2. Coordinates must be valid.
5. Error Responses:
   1. 400 `DHABA_INVALID_PROFILE`
   2. 409 `DHABA_PROFILE_EXISTS`
6. Permission Rules:
   1. `role=dhaba_owner` required.

#### GET /api/v1/dhaba-profile/me

1. Authentication Required: Yes (Dhaba Owner)
2. Request Schema: None
3. Response Schema (200):
   1. Dhaba profile object
   2. amenities array
   3. photos array
   4. menuItems array
4. Validation Rules:
   1. Owner role must be dhaba_owner.
5. Error Responses:
   1. 404 `DHABA_PROFILE_NOT_FOUND`
6. Permission Rules:
   1. `role=dhaba_owner` required.

#### PUT /api/v1/dhaba-profile/me

1. Authentication Required: Yes (Dhaba Owner)
2. Request Schema:
   1. `businessName` string
   2. `phoneE164` string
   3. `addressLine` string
   4. `state` string
   5. `district` string
   6. `pincode` string
   7. `latitude` number
   8. `longitude` number
   9. `isActive` boolean
3. Response Schema (200):
   1. Updated profile object
4. Validation Rules:
   1. Pincode 6 digits.
5. Error Responses:
   1. 400 `DHABA_INVALID_PROFILE`
6. Permission Rules:
   1. `role=dhaba_owner` required.

#### PUT /api/v1/dhaba-profile/me/amenities

1. Authentication Required: Yes (Dhaba Owner)
2. Request Schema:
   1. `amenities` array of object
      1. `amenityName` string
      2. `isAvailable` boolean
3. Response Schema (200):
   1. `amenities` array
4. Validation Rules:
   1. Deduplicate amenity names case-insensitively.
5. Error Responses:
   1. 400 `DHABA_INVALID_AMENITIES`
6. Permission Rules:
   1. `role=dhaba_owner` required.

#### POST /api/v1/dhaba-profile/me/photos

1. Authentication Required: Yes (Dhaba Owner)
2. Request Schema:
   1. `photoUrl` string required
   2. `displayOrder` integer optional
3. Response Schema (201):
   1. `photoId` uuid
   2. `photoUrl` string
   3. `displayOrder` integer
4. Validation Rules:
   1. `photoUrl` must be valid https URL.
   2. `displayOrder` if present must be > 0.
5. Error Responses:
   1. 400 `DHABA_INVALID_PHOTO`
   2. 409 `DHABA_PHOTO_DUPLICATE`
6. Permission Rules:
   1. `role=dhaba_owner` required.

#### DELETE /api/v1/dhaba-profile/me/photos/{photoId}

1. Authentication Required: Yes (Dhaba Owner)
2. Request Schema:
   1. Path `photoId` uuid required
3. Response Schema (200):
   1. `success` boolean
4. Validation Rules:
   1. Photo must belong to requester.
5. Error Responses:
   1. 404 `DHABA_PHOTO_NOT_FOUND`
   2. 403 `AUTH_FORBIDDEN`
6. Permission Rules:
   1. `role=dhaba_owner` required.

#### PUT /api/v1/dhaba-profile/me/menu-items

1. Authentication Required: Yes (Dhaba Owner)
2. Request Schema:
   1. `menuItems` array
      1. `itemName` string
      2. `priceInr` number
      3. `isAvailable` boolean
3. Response Schema (200):
   1. `menuItems` array
4. Validation Rules:
   1. Price >= 0.
   2. Deduplicate item names case-insensitively.
5. Error Responses:
   1. 400 `DHABA_INVALID_MENU`
6. Permission Rules:
   1. `role=dhaba_owner` required.

### Mechanic Profiles

#### POST /api/v1/mechanic-profile/me

1. Authentication Required: Yes (Mechanic Owner)
2. Request Schema:
   1. `businessName` string
   2. `phoneE164` string
   3. `addressLine` string
   4. `state` string
   5. `district` string
   6. `pincode` string
   7. `latitude` number
   8. `longitude` number
3. Response Schema (201):
   1. `userId` uuid
   2. `availabilityStatus` enum
4. Validation Rules:
   1. Owner role must be mechanic_owner.
5. Error Responses:
   1. 400 `MECHANIC_INVALID_PROFILE`
   2. 409 `MECHANIC_PROFILE_EXISTS`
6. Permission Rules:
   1. `role=mechanic_owner` required.

#### GET /api/v1/mechanic-profile/me

1. Authentication Required: Yes (Mechanic Owner)
2. Request Schema: None
3. Response Schema (200):
   1. Mechanic profile object
   2. services array
4. Validation Rules:
   1. Owner role must be mechanic_owner.
5. Error Responses:
   1. 404 `MECHANIC_PROFILE_NOT_FOUND`
6. Permission Rules:
   1. `role=mechanic_owner` required.

#### PUT /api/v1/mechanic-profile/me

1. Authentication Required: Yes (Mechanic Owner)
2. Request Schema:
   1. `businessName` string
   2. `phoneE164` string
   3. `addressLine` string
   4. `state` string
   5. `district` string
   6. `pincode` string
   7. `latitude` number
   8. `longitude` number
   9. `isActive` boolean
3. Response Schema (200):
   1. Updated mechanic profile object
4. Validation Rules:
   1. Coordinates valid.
5. Error Responses:
   1. 400 `MECHANIC_INVALID_PROFILE`
6. Permission Rules:
   1. `role=mechanic_owner` required.

#### PUT /api/v1/mechanic-profile/me/services

1. Authentication Required: Yes (Mechanic Owner)
2. Request Schema:
   1. `services` array
      1. `serviceName` string
      2. `isAvailable` boolean
3. Response Schema (200):
   1. `services` array
4. Validation Rules:
   1. Deduplicate service names case-insensitively.
5. Error Responses:
   1. 400 `MECHANIC_INVALID_SERVICES`
6. Permission Rules:
   1. `role=mechanic_owner` required.

#### PATCH /api/v1/mechanic-profile/me/availability

1. Authentication Required: Yes (Mechanic Owner)
2. Request Schema:
   1. `availabilityStatus` enum available|busy|offline
3. Response Schema (200):
   1. `availabilityStatus` enum
4. Validation Rules:
   1. Value must be one of allowed states.
5. Error Responses:
   1. 400 `MECHANIC_INVALID_AVAILABILITY`
6. Permission Rules:
   1. `role=mechanic_owner` required.

### Vendor Discovery

#### GET /api/v1/vendors/discovery

1. Authentication Required: Yes (Driver)
2. Request Schema (Query):
   1. `latitude` number required
   2. `longitude` number required
   3. `radiusKm` number required
   4. `vendorType` enum dhaba|mechanic|all optional
   5. `page` integer >=1 optional
   6. `limit` integer 1..50 optional
3. Response Schema (200):
   1. `items` array
      1. `vendorUserId` uuid
      2. `vendorType` enum
      3. `businessName` string
      4. `distanceKm` number
      5. `isActive` boolean
      6. `ratingAverage` number|null
   2. `pagination` object
4. Validation Rules:
   1. Radius between 1 and 100 km.
   2. Coordinates valid.
5. Error Responses:
   1. 400 `VENDOR_INVALID_DISCOVERY_QUERY`
   2. 401 `AUTH_UNAUTHORIZED`
   3. 403 `AUTH_FORBIDDEN`
6. Permission Rules:
   1. `role=driver` required.

#### GET /api/v1/vendors/{vendorUserId}

1. Authentication Required: Yes (Driver)
2. Request Schema:
   1. Path `vendorUserId` uuid required
3. Response Schema (200):
   1. `vendorUserId` uuid
   2. `vendorType` enum dhaba|mechanic
   3. `businessName` string
   4. `phoneE164` string
   5. `address` object
   6. `latitude` number
   7. `longitude` number
   8. `dhabaData` object nullable
   9. `mechanicData` object nullable
4. Validation Rules:
   1. `vendorUserId` must belong to dhaba_owner or mechanic_owner.
5. Error Responses:
   1. 404 `VENDOR_NOT_FOUND`
   2. 403 `AUTH_FORBIDDEN`
6. Permission Rules:
   1. `role=driver` required.

#### GET /api/v1/vendors/{vendorUserId}/distance

1. Authentication Required: Yes (Driver)
2. Request Schema:
   1. Path `vendorUserId` uuid required
   2. Query `fromLatitude` number optional
   3. Query `fromLongitude` number optional
3. Response Schema (200):
   1. `vendorUserId` uuid
   2. `distanceKm` number
   3. `computedFrom` enum provided_coordinates|driver_last_location
4. Validation Rules:
   1. If one of `fromLatitude` or `fromLongitude` is provided, both are required.
5. Error Responses:
   1. 400 `VENDOR_INVALID_DISTANCE_QUERY`
   2. 404 `VENDOR_NOT_FOUND`
6. Permission Rules:
   1. `role=driver` required.

### Reviews

#### GET /api/v1/vendors/{vendorUserId}/reviews

1. Authentication Required: Yes (Driver)
2. Request Schema:
   1. Path `vendorUserId` uuid required
   2. Query `page` integer >=1 optional
   3. Query `limit` integer 1..50 optional
3. Response Schema (200):
   1. `items` array
      1. `reviewId` uuid
      2. `reviewerUserId` uuid
      3. `rating` integer
      4. `reviewText` string|null
      5. `createdAt` datetime
   2. `summary` object
      1. `averageRating` number
      2. `totalReviews` integer
4. Validation Rules:
   1. `vendorUserId` must be vendor role user.
5. Error Responses:
   1. 404 `VENDOR_NOT_FOUND`
   2. 400 `REVIEW_INVALID_QUERY`
6. Permission Rules:
   1. `role=driver` required.

#### POST /api/v1/reviews

1. Authentication Required: Yes (Driver)
2. Request Schema:
   1. `vendorUserId` uuid required
   2. `vendorType` enum dhaba|mechanic required
   3. `rating` integer required
   4. `reviewText` string optional
3. Response Schema (201):
   1. `reviewId` uuid
   2. `vendorUserId` uuid
   3. `rating` integer
   4. `reviewText` string|null
   5. `createdAt` datetime
4. Validation Rules:
   1. One review per driver per vendor.
   2. Rating must be integer 1..5.
   3. Vendor role must match vendorType.
5. Error Responses:
   1. 400 `REVIEW_INVALID_PAYLOAD`
   2. 403 `AUTH_FORBIDDEN`
   3. 409 `REVIEW_ALREADY_EXISTS`
6. Permission Rules:
   1. `role=driver` required.

## 3) OpenAPI-Style Specification

```yaml
openapi: 3.0.3
info:
  title: Highway Setu V1 API
  version: 1.0.0
servers:
  - url: /api/v1
components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
  schemas:
    ErrorEnvelope:
      type: object
      required: [code, message, requestId]
      properties:
        code: { type: string }
        message: { type: string }
        details: { type: object, nullable: true }
        requestId: { type: string }
    UserSummary:
      type: object
      properties:
        id: { type: string, format: uuid }
        role: { type: string, enum: [driver, dhaba_owner, mechanic_owner, admin] }
        verificationStatus: { type: string, enum: [pending, verified, rejected] }
        preferredLanguage: { type: string, enum: [english, hindi, punjabi] }
paths:
  /auth/send-otp:
    post:
      summary: Send OTP to phone number
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [phoneE164]
              properties:
                phoneE164: { type: string }
      responses:
        '200':
          description: OTP sent
        '400':
          description: Invalid phone
  /auth/verify-otp:
    post:
      summary: Verify OTP and issue tokens
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [phoneE164, otpCode, verificationToken]
      responses:
        '200': { description: Auth success }
        '401': { description: OTP expired or invalid }
  /auth/logout:
    post:
      security: [{ bearerAuth: [] }]
      summary: Logout session
      responses:
        '200': { description: Logged out }
  /auth/me:
    get:
      security: [{ bearerAuth: [] }]
      summary: Current auth context
      responses:
        '200': { description: Context returned }
  /users/me:
    get:
      security: [{ bearerAuth: [] }]
      summary: Get current user
      responses:
        '200': { description: User returned }
  /users/me/language:
    patch:
      security: [{ bearerAuth: [] }]
      summary: Update preferred language
      responses:
        '200': { description: Language updated }
  /admin/users:
    get:
      security: [{ bearerAuth: [] }]
      summary: Admin list users
      responses:
        '200': { description: User list }
        '403': { description: Forbidden }
  /admin/users/{userId}/verification:
    patch:
      security: [{ bearerAuth: [] }]
      summary: Admin update verification
      parameters:
        - in: path
          name: userId
          required: true
          schema: { type: string, format: uuid }
      responses:
        '200': { description: Verification updated }
  /driver-profile/me:
    get:
      security: [{ bearerAuth: [] }]
      summary: Get driver profile
      responses:
        '200': { description: Profile returned }
    put:
      security: [{ bearerAuth: [] }]
      summary: Update driver profile
      responses:
        '200': { description: Profile updated }
  /driver-profile/me/truck:
    patch:
      security: [{ bearerAuth: [] }]
      summary: Update truck details
      responses:
        '200': { description: Truck updated }
  /driver-profile/me/journey/start:
    post:
      security: [{ bearerAuth: [] }]
      summary: Start journey and enable tracking
      responses:
        '200': { description: Journey started }
  /driver-profile/me/gps:
    patch:
      security: [{ bearerAuth: [] }]
      summary: Update driver GPS point
      responses:
        '200': { description: GPS accepted }
  /dhaba-profile/me:
    post:
      security: [{ bearerAuth: [] }]
      summary: Register dhaba profile
      responses:
        '201': { description: Created }
    get:
      security: [{ bearerAuth: [] }]
      summary: Get dhaba profile
      responses:
        '200': { description: Returned }
    put:
      security: [{ bearerAuth: [] }]
      summary: Update dhaba profile
      responses:
        '200': { description: Updated }
  /dhaba-profile/me/amenities:
    put:
      security: [{ bearerAuth: [] }]
      summary: Replace amenities
      responses:
        '200': { description: Updated }
  /dhaba-profile/me/photos:
    post:
      security: [{ bearerAuth: [] }]
      summary: Add dhaba photo
      responses:
        '201': { description: Photo added }
  /dhaba-profile/me/photos/{photoId}:
    delete:
      security: [{ bearerAuth: [] }]
      summary: Delete dhaba photo
      parameters:
        - in: path
          name: photoId
          required: true
          schema: { type: string, format: uuid }
      responses:
        '200': { description: Deleted }
  /dhaba-profile/me/menu-items:
    put:
      security: [{ bearerAuth: [] }]
      summary: Replace menu items
      responses:
        '200': { description: Updated }
  /mechanic-profile/me:
    post:
      security: [{ bearerAuth: [] }]
      summary: Register mechanic profile
      responses:
        '201': { description: Created }
    get:
      security: [{ bearerAuth: [] }]
      summary: Get mechanic profile
      responses:
        '200': { description: Returned }
    put:
      security: [{ bearerAuth: [] }]
      summary: Update mechanic profile
      responses:
        '200': { description: Updated }
  /mechanic-profile/me/services:
    put:
      security: [{ bearerAuth: [] }]
      summary: Replace mechanic services
      responses:
        '200': { description: Updated }
  /mechanic-profile/me/availability:
    patch:
      security: [{ bearerAuth: [] }]
      summary: Update mechanic availability
      responses:
        '200': { description: Updated }
  /vendors/discovery:
    get:
      security: [{ bearerAuth: [] }]
      summary: Discover nearby vendors
      responses:
        '200': { description: Vendors returned }
  /vendors/{vendorUserId}:
    get:
      security: [{ bearerAuth: [] }]
      summary: Get vendor details
      parameters:
        - in: path
          name: vendorUserId
          required: true
          schema: { type: string, format: uuid }
      responses:
        '200': { description: Vendor returned }
  /vendors/{vendorUserId}/distance:
    get:
      security: [{ bearerAuth: [] }]
      summary: Compute distance to vendor
      parameters:
        - in: path
          name: vendorUserId
          required: true
          schema: { type: string, format: uuid }
      responses:
        '200': { description: Distance returned }
  /vendors/{vendorUserId}/reviews:
    get:
      security: [{ bearerAuth: [] }]
      summary: List vendor reviews
      parameters:
        - in: path
          name: vendorUserId
          required: true
          schema: { type: string, format: uuid }
      responses:
        '200': { description: Reviews returned }
  /reviews:
    post:
      security: [{ bearerAuth: [] }]
      summary: Create vendor review
      responses:
        '201': { description: Review created }
```

## 4) Endpoint Dependency Map

```mermaid
graph TD
  A[POST /auth/send-otp] --> B[POST /auth/verify-otp]
  B --> C[GET /auth/me]
  B --> D[GET /users/me]
  D --> E[GET /driver-profile/me]
  D --> F[GET /dhaba-profile/me]
  D --> G[GET /mechanic-profile/me]
  E --> H[POST /driver-profile/me/journey/start]
  H --> I[PATCH /driver-profile/me/gps]
  I --> J[GET /vendors/discovery]
  J --> K[GET /vendors/{vendorUserId}]
  K --> L[GET /vendors/{vendorUserId}/distance]
  K --> M[GET /vendors/{vendorUserId}/reviews]
  K --> N[POST /reviews]
  O[GET /admin/users] --> P[PATCH /admin/users/{userId}/verification]
```

## 5) Module Ownership Map

| API Module | Backend Owner Module | Primary Tables | Primary Consumers |
|---|---|---|---|
| Authentication | auth | users | OTP Login, App Bootstrap |
| Users | users + admin | users | Profile bootstrap, Language, Admin verification |
| Driver Profiles | drivers | driver_profiles, users | Driver Profile, Truck Details, Start Journey, GPS Tracking |
| Dhaba Profiles | dhabas | dhaba_profiles, dhaba_amenities, dhaba_photos, dhaba_menu_items | Dhaba Registration/Profile/Amenities/Photos/Menu |
| Mechanic Profiles | mechanics | mechanic_profiles, mechanic_services | Mechanic Registration/Services/Availability |
| Vendor Discovery | vendors | dhaba_profiles, mechanic_profiles, reviews | Vendor Discovery, Vendor Details, Distance |
| Reviews | reviews | reviews, users | Vendor Details |

## 6) API Audit

### Duplicate Endpoints

No duplicate endpoints detected.

Rationale:

1. Single profile endpoint per actor module.
2. Admin verification isolated under `/admin/users`.
3. Distance and details split by responsibility.

### Missing Endpoints

No missing endpoints for locked V1 flows in this contract.

Coverage checks:

1. Driver: OTP, profile, truck, start journey, GPS, discovery, details, distance all covered.
2. Dhaba: registration, profile, amenities, photos, menu covered.
3. Mechanic: registration, services, availability covered.
4. Admin: user verification and vendor management represented through admin user listing plus verification update, and vendor operations via profile management endpoints and discovery views.

### Security Risks

1. Risk: GPS update endpoint can be abused for high-frequency writes.
   1. Mitigation: per-user rate limiting and timestamp staleness checks.
2. Risk: Public OTP endpoints can be brute-forced.
   1. Mitigation: send and verify rate limits, captcha or abuse filters, IP throttling.
3. Risk: Photo URL ingestion can be abused for malicious URLs.
   1. Mitigation: allowlist storage host validation and content scanning in upload pipeline.

### Permission Issues

1. Role checks are required on every role-specific endpoint.
2. Admin endpoints must reject non-admin JWTs.
3. Review creation must enforce `role=driver` and vendor role parity against `vendorType`.
4. Vendor detail endpoints must expose only active and approved vendors to drivers by default.

### Dead Endpoints

No dead endpoints detected.

Each endpoint maps to at least one V1 screen flow listed in the API inventory.

## 7) Prohibited Endpoint Confirmation

This contract includes no endpoints for:

1. Payments
2. SOS
3. Ordering
4. Loyalty
5. Referrals
# Highway Setu V1 API Contract

## Scope and Constraints

This API contract is restricted to approved V1 modules only:

1. Authentication
2. Users
3. Driver Profiles
4. Dhaba Profiles
5. Mechanic Profiles
6. Vendor Discovery
7. Reviews

Explicitly excluded from this contract:

1. Payments
2. SOS
3. Ordering
4. Loyalty
5. Referrals

All routes are versioned under `/api/v1`.

## 1) API Inventory

| Module | Endpoint | Method | Consuming V1 Screen | Notes |
|---|---|---|---|---|
| Authentication | /api/v1/auth/send-otp | POST | OTP Login | Start OTP challenge |
| Authentication | /api/v1/auth/verify-otp | POST | OTP Login | Verify OTP and create session |
| Authentication | /api/v1/auth/refresh | POST | App Session Bootstrap | Refresh access token |
| Authentication | /api/v1/auth/logout | POST | Profile, Settings | End session |
| Users | /api/v1/users/me | GET | Driver Home, Dhaba Home, Mechanic Home | Current user context |
| Users | /api/v1/users/me/language | PATCH | Language Selection | Update preferred language |
| Users | /api/v1/admin/users | GET | Admin User Verification List | User management list |
| Users | /api/v1/admin/users/{userId}/verification | PATCH | Admin User Verification Detail | Verify or reject user |
| Driver Profiles | /api/v1/driver-profiles/me | GET | Driver Profile | Load driver profile |
| Driver Profiles | /api/v1/driver-profiles/me | PUT | Driver Profile | Update driver profile |
| Driver Profiles | /api/v1/driver-profiles/me/truck | PATCH | Truck Details | Update truck details |
| Driver Profiles | /api/v1/driver-profiles/me/journey/start | POST | Start Journey | Start journey state |
| Driver Profiles | /api/v1/driver-profiles/me/location | POST | GPS Tracking | Submit current location |
| Dhaba Profiles | /api/v1/dhaba-profiles/me | POST | Dhaba Registration | Create dhaba profile |
| Dhaba Profiles | /api/v1/dhaba-profiles/me | GET | Dhaba Profile | Load dhaba profile |
| Dhaba Profiles | /api/v1/dhaba-profiles/me | PATCH | Dhaba Profile | Update dhaba profile |
| Dhaba Profiles | /api/v1/dhaba-profiles/me/amenities | PUT | Dhaba Amenities | Replace amenities list |
| Dhaba Profiles | /api/v1/dhaba-profiles/me/photos | POST | Dhaba Photos | Add dhaba photo |
| Dhaba Profiles | /api/v1/dhaba-profiles/me/photos/{photoId} | DELETE | Dhaba Photos | Remove dhaba photo |
| Dhaba Profiles | /api/v1/dhaba-profiles/me/menu-items | PUT | Dhaba Menu | Replace menu list |
| Mechanic Profiles | /api/v1/mechanic-profiles/me | POST | Mechanic Registration | Create mechanic profile |
| Mechanic Profiles | /api/v1/mechanic-profiles/me | GET | Mechanic Profile | Load mechanic profile |
| Mechanic Profiles | /api/v1/mechanic-profiles/me | PATCH | Mechanic Profile | Update mechanic profile |
| Mechanic Profiles | /api/v1/mechanic-profiles/me/services | PUT | Mechanic Services | Replace services list |
| Mechanic Profiles | /api/v1/mechanic-profiles/me/availability | PATCH | Mechanic Availability | Update availability status |
| Vendor Discovery | /api/v1/vendors/discovery | GET | Vendor Discovery | Nearby vendor feed |
| Vendor Discovery | /api/v1/vendors/{vendorType}/{vendorUserId} | GET | Vendor Details | Vendor detail data |
| Reviews | /api/v1/reviews | POST | Vendor Details | Create review |
| Reviews | /api/v1/reviews | GET | Vendor Details | List vendor reviews |

## 2) Endpoint Contracts

### Authentication

#### 2.1 POST /api/v1/auth/send-otp
- Authentication required: No
- Request schema:
  - `phoneE164`: string, required, pattern `^\+[1-9][0-9]{7,14}$`
  - `role`: string, required, enum `driver|dhaba_owner|mechanic_owner`
- Response schema:
  - `requestId`: string
  - `otpProvider`: string, enum `firebase`
  - `expiresInSeconds`: integer
- Validation rules:
  - Phone format must be E.164.
  - Role must be one of allowed app roles.
- Error responses:
  - `400 INVALID_PHONE`
  - `400 INVALID_ROLE`
  - `429 OTP_RATE_LIMITED`
  - `500 OTP_PROVIDER_ERROR`
- Permission rules:
  - Public endpoint.

#### 2.2 POST /api/v1/auth/verify-otp
- Authentication required: No
- Request schema:
  - `requestId`: string, required
  - `phoneE164`: string, required
  - `otpCode`: string, required, min 4, max 8
  - `preferredLanguage`: string, required, enum `english|hindi|punjabi`
- Response schema:
  - `accessToken`: string
  - `refreshToken`: string
  - `tokenType`: string, value `Bearer`
  - `expiresInSeconds`: integer
  - `user`: object
    - `id`: uuid
    - `phoneE164`: string
    - `role`: string
    - `verificationStatus`: string
    - `preferredLanguage`: string
- Validation rules:
  - OTP code must match active request.
  - Preferred language must match allowed values.
- Error responses:
  - `400 INVALID_OTP`
  - `401 OTP_EXPIRED`
  - `409 ROLE_MISMATCH`
  - `500 AUTH_PROVIDER_ERROR`
- Permission rules:
  - Public endpoint.

#### 2.3 POST /api/v1/auth/refresh
- Authentication required: Refresh token
- Request schema:
  - `refreshToken`: string, required
- Response schema:
  - `accessToken`: string
  - `tokenType`: string
  - `expiresInSeconds`: integer
- Validation rules:
  - Refresh token must be valid and active.
- Error responses:
  - `401 INVALID_REFRESH_TOKEN`
  - `401 REFRESH_TOKEN_EXPIRED`
- Permission rules:
  - Token subject must exist in `users`.

#### 2.4 POST /api/v1/auth/logout
- Authentication required: Yes, user JWT
- Request schema:
  - `refreshToken`: string, required
- Response schema:
  - `success`: boolean
- Validation rules:
  - JWT subject and refresh token subject must match.
- Error responses:
  - `401 UNAUTHORIZED`
- Permission rules:
  - Any authenticated user.

### Users

#### 2.5 GET /api/v1/users/me
- Authentication required: Yes, user JWT
- Request schema: none
- Response schema:
  - `id`: uuid
  - `phoneE164`: string
  - `role`: string
  - `verificationStatus`: string
  - `preferredLanguage`: string
- Validation rules:
  - JWT must be valid.
- Error responses:
  - `401 UNAUTHORIZED`
  - `404 USER_NOT_FOUND`
- Permission rules:
  - Returns only caller identity.

#### 2.6 PATCH /api/v1/users/me/language
- Authentication required: Yes, user JWT
- Request schema:
  - `preferredLanguage`: string, required, enum `english|hindi|punjabi`
- Response schema:
  - `id`: uuid
  - `preferredLanguage`: string
- Validation rules:
  - Language must be one of supported values.
- Error responses:
  - `400 INVALID_LANGUAGE`
  - `401 UNAUTHORIZED`
- Permission rules:
  - User can only update own language.

#### 2.7 GET /api/v1/admin/users
- Authentication required: Yes, admin JWT
- Request schema (query):
  - `role`: optional enum `driver|dhaba_owner|mechanic_owner|admin`
  - `verificationStatus`: optional enum `pending|verified|rejected`
  - `page`: integer, default 1, min 1
  - `pageSize`: integer, default 20, max 100
- Response schema:
  - `items`: array of user summary
  - `pagination`: object with `page`, `pageSize`, `total`
- Validation rules:
  - Query values must be valid enums and limits.
- Error responses:
  - `401 UNAUTHORIZED`
  - `403 FORBIDDEN`
  - `400 INVALID_QUERY`
- Permission rules:
  - Admin role only.

#### 2.8 PATCH /api/v1/admin/users/{userId}/verification
- Authentication required: Yes, admin JWT
- Request schema:
  - `verificationStatus`: enum `verified|rejected`, required
- Response schema:
  - `id`: uuid
  - `verificationStatus`: string
  - `updatedAt`: datetime
- Validation rules:
  - `userId` must exist.
  - Status transition must be valid.
- Error responses:
  - `400 INVALID_STATUS`
  - `401 UNAUTHORIZED`
  - `403 FORBIDDEN`
  - `404 USER_NOT_FOUND`
- Permission rules:
  - Admin role only.

### Driver Profiles

#### 2.9 GET /api/v1/driver-profiles/me
- Authentication required: Yes, driver JWT
- Request schema: none
- Response schema:
  - `userId`: uuid
  - `fullName`: string
  - `licenseNumber`: string
  - `truckRegistrationNumber`: string
  - `truckType`: string
  - `gpsTrackingEnabled`: boolean
  - `currentLatitude`: number nullable
  - `currentLongitude`: number nullable
  - `lastLocationAt`: datetime nullable
- Validation rules:
  - Caller role must be `driver`.
- Error responses:
  - `401 UNAUTHORIZED`
  - `403 FORBIDDEN`
  - `404 DRIVER_PROFILE_NOT_FOUND`
- Permission rules:
  - Driver role only, own profile only.

#### 2.10 PUT /api/v1/driver-profiles/me
- Authentication required: Yes, driver JWT
- Request schema:
  - `fullName`: string, required, min 2, max 100
  - `licenseNumber`: string, required, min 4, max 40
  - `truckRegistrationNumber`: string, required
  - `truckType`: string, required
- Response schema:
  - Full driver profile object
- Validation rules:
  - Required fields cannot be empty.
  - Truck registration must be unique.
- Error responses:
  - `400 VALIDATION_ERROR`
  - `401 UNAUTHORIZED`
  - `403 FORBIDDEN`
  - `409 TRUCK_REGISTRATION_CONFLICT`
- Permission rules:
  - Driver role only, own profile only.

#### 2.11 PATCH /api/v1/driver-profiles/me/truck
- Authentication required: Yes, driver JWT
- Request schema:
  - `truckRegistrationNumber`: string, required
  - `truckType`: string, required
- Response schema:
  - `truckRegistrationNumber`: string
  - `truckType`: string
  - `updatedAt`: datetime
- Validation rules:
  - Truck registration must be unique.
- Error responses:
  - `400 VALIDATION_ERROR`
  - `409 TRUCK_REGISTRATION_CONFLICT`
  - `401 UNAUTHORIZED`
- Permission rules:
  - Driver role only, own profile only.

#### 2.12 POST /api/v1/driver-profiles/me/journey/start
- Authentication required: Yes, driver JWT
- Request schema:
  - `currentLatitude`: number, required
  - `currentLongitude`: number, required
  - `startedAt`: datetime, required
- Response schema:
  - `gpsTrackingEnabled`: boolean
  - `lastLocationAt`: datetime
- Validation rules:
  - Latitude range -90 to 90.
  - Longitude range -180 to 180.
- Error responses:
  - `400 INVALID_COORDINATES`
  - `401 UNAUTHORIZED`
  - `403 FORBIDDEN`
- Permission rules:
  - Driver role only.

#### 2.13 POST /api/v1/driver-profiles/me/location
- Authentication required: Yes, driver JWT
- Request schema:
  - `currentLatitude`: number, required
  - `currentLongitude`: number, required
  - `capturedAt`: datetime, required
- Response schema:
  - `gpsTrackingEnabled`: boolean
  - `currentLatitude`: number
  - `currentLongitude`: number
  - `lastLocationAt`: datetime
- Validation rules:
  - Valid latitude and longitude ranges.
  - `capturedAt` cannot be more than 5 minutes in future.
- Error responses:
  - `400 INVALID_COORDINATES`
  - `400 INVALID_CAPTURE_TIME`
  - `401 UNAUTHORIZED`
  - `403 FORBIDDEN`
- Permission rules:
  - Driver role only, own location only.

### Dhaba Profiles

#### 2.14 POST /api/v1/dhaba-profiles/me
- Authentication required: Yes, dhaba_owner JWT
- Request schema:
  - `businessName`: string, required
  - `phoneE164`: string, required
  - `addressLine`: string, required
  - `state`: string, required
  - `district`: string, required
  - `pincode`: string, required
  - `latitude`: number, required
  - `longitude`: number, required
- Response schema:
  - Full dhaba profile object
- Validation rules:
  - Coordinates must be valid.
  - Phone must be E.164.
- Error responses:
  - `400 VALIDATION_ERROR`
  - `401 UNAUTHORIZED`
  - `403 FORBIDDEN`
  - `409 PROFILE_ALREADY_EXISTS`
- Permission rules:
  - Dhaba owner role only.

#### 2.15 GET /api/v1/dhaba-profiles/me
- Authentication required: Yes, dhaba_owner JWT
- Request schema: none
- Response schema:
  - Dhaba profile object including amenities, photos, and menu summary counts
- Validation rules:
  - Caller must be dhaba owner.
- Error responses:
  - `401 UNAUTHORIZED`
  - `403 FORBIDDEN`
  - `404 DHABA_PROFILE_NOT_FOUND`
- Permission rules:
  - Own profile only.

#### 2.16 PATCH /api/v1/dhaba-profiles/me
- Authentication required: Yes, dhaba_owner JWT
- Request schema:
  - Any subset of `businessName|phoneE164|addressLine|state|district|pincode|latitude|longitude|isActive`
- Response schema:
  - Updated dhaba profile object
- Validation rules:
  - Provided fields must pass type and range checks.
- Error responses:
  - `400 VALIDATION_ERROR`
  - `401 UNAUTHORIZED`
  - `403 FORBIDDEN`
- Permission rules:
  - Own profile only.

#### 2.17 PUT /api/v1/dhaba-profiles/me/amenities
- Authentication required: Yes, dhaba_owner JWT
- Request schema:
  - `amenities`: array, required
    - item:
      - `amenityName`: string, required
      - `isAvailable`: boolean, required
- Response schema:
  - `amenities`: array
- Validation rules:
  - No duplicate `amenityName` in payload.
  - Maximum 50 amenities.
- Error responses:
  - `400 VALIDATION_ERROR`
  - `409 DUPLICATE_AMENITY`
- Permission rules:
  - Dhaba owner role only, own profile only.

#### 2.18 POST /api/v1/dhaba-profiles/me/photos
- Authentication required: Yes, dhaba_owner JWT
- Request schema:
  - `photoUrl`: string, required, uri
  - `displayOrder`: integer, optional, min 1
- Response schema:
  - `id`: uuid
  - `photoUrl`: string
  - `displayOrder`: integer
- Validation rules:
  - Valid URL required.
- Error responses:
  - `400 INVALID_PHOTO_URL`
  - `409 DUPLICATE_PHOTO`
- Permission rules:
  - Dhaba owner role only.

#### 2.19 DELETE /api/v1/dhaba-profiles/me/photos/{photoId}
- Authentication required: Yes, dhaba_owner JWT
- Request schema: path param `photoId` uuid
- Response schema:
  - `success`: boolean
- Validation rules:
  - `photoId` must belong to caller profile.
- Error responses:
  - `404 PHOTO_NOT_FOUND`
  - `403 FORBIDDEN`
- Permission rules:
  - Own profile only.

#### 2.20 PUT /api/v1/dhaba-profiles/me/menu-items
- Authentication required: Yes, dhaba_owner JWT
- Request schema:
  - `menuItems`: array, required
    - item:
      - `itemName`: string, required
      - `priceInr`: number, required, min 0
      - `isAvailable`: boolean, required
- Response schema:
  - `menuItems`: array
- Validation rules:
  - No duplicate item names.
  - Maximum 300 menu items.
- Error responses:
  - `400 VALIDATION_ERROR`
  - `409 DUPLICATE_MENU_ITEM`
- Permission rules:
  - Dhaba owner role only.

### Mechanic Profiles

#### 2.21 POST /api/v1/mechanic-profiles/me
- Authentication required: Yes, mechanic_owner JWT
- Request schema:
  - `businessName`: string, required
  - `phoneE164`: string, required
  - `addressLine`: string, required
  - `state`: string, required
  - `district`: string, required
  - `pincode`: string, required
  - `latitude`: number, required
  - `longitude`: number, required
- Response schema:
  - Full mechanic profile object
- Validation rules:
  - Coordinates and phone format checks.
- Error responses:
  - `400 VALIDATION_ERROR`
  - `409 PROFILE_ALREADY_EXISTS`
- Permission rules:
  - Mechanic owner role only.

#### 2.22 GET /api/v1/mechanic-profiles/me
- Authentication required: Yes, mechanic_owner JWT
- Request schema: none
- Response schema:
  - Mechanic profile object including services summary count
- Validation rules:
  - Caller must be mechanic owner.
- Error responses:
  - `401 UNAUTHORIZED`
  - `403 FORBIDDEN`
  - `404 MECHANIC_PROFILE_NOT_FOUND`
- Permission rules:
  - Own profile only.

#### 2.23 PATCH /api/v1/mechanic-profiles/me
- Authentication required: Yes, mechanic_owner JWT
- Request schema:
  - Any subset of `businessName|phoneE164|addressLine|state|district|pincode|latitude|longitude|isActive`
- Response schema:
  - Updated mechanic profile object
- Validation rules:
  - Provided fields must satisfy types and coordinate ranges.
- Error responses:
  - `400 VALIDATION_ERROR`
  - `401 UNAUTHORIZED`
  - `403 FORBIDDEN`
- Permission rules:
  - Own profile only.

#### 2.24 PUT /api/v1/mechanic-profiles/me/services
- Authentication required: Yes, mechanic_owner JWT
- Request schema:
  - `services`: array, required
    - item:
      - `serviceName`: string, required
      - `isAvailable`: boolean, required
- Response schema:
  - `services`: array
- Validation rules:
  - No duplicate service names.
  - Maximum 200 services.
- Error responses:
  - `400 VALIDATION_ERROR`
  - `409 DUPLICATE_SERVICE`
- Permission rules:
  - Mechanic owner role only.

#### 2.25 PATCH /api/v1/mechanic-profiles/me/availability
- Authentication required: Yes, mechanic_owner JWT
- Request schema:
  - `availabilityStatus`: enum `available|busy|offline`
- Response schema:
  - `availabilityStatus`: string
  - `updatedAt`: datetime
- Validation rules:
  - Status must match allowed enum.
- Error responses:
  - `400 INVALID_AVAILABILITY_STATUS`
  - `401 UNAUTHORIZED`
  - `403 FORBIDDEN`
- Permission rules:
  - Mechanic owner role only.

### Vendor Discovery

#### 2.26 GET /api/v1/vendors/discovery
- Authentication required: Yes, driver JWT
- Request schema (query):
  - `latitude`: number, required
  - `longitude`: number, required
  - `radiusKm`: number, optional, default 10, max 100
  - `vendorType`: enum `dhaba|mechanic|all`, optional, default `all`
  - `page`: integer, optional, default 1
  - `pageSize`: integer, optional, default 20, max 100
- Response schema:
  - `items`: array
    - `vendorUserId`: uuid
    - `vendorType`: `dhaba|mechanic`
    - `businessName`: string
    - `distanceKm`: number
    - `isActive`: boolean
    - `availabilityStatus`: nullable string
    - `ratingAverage`: nullable number
    - `reviewCount`: integer
  - `pagination`: object
- Validation rules:
  - Coordinates required and valid.
  - Radius within allowed range.
- Error responses:
  - `400 INVALID_QUERY`
  - `401 UNAUTHORIZED`
  - `403 FORBIDDEN`
- Permission rules:
  - Driver role only.

#### 2.27 GET /api/v1/vendors/{vendorType}/{vendorUserId}
- Authentication required: Yes, driver JWT
- Request schema:
  - `vendorType`: path enum `dhaba|mechanic`
  - `vendorUserId`: path uuid
  - `latitude`: query number, required
  - `longitude`: query number, required
- Response schema:
  - Common fields:
    - `vendorUserId`, `vendorType`, `businessName`, `phoneE164`, `addressLine`, `district`, `state`, `distanceKm`
  - Dhaba fields:
    - `amenities`: array
    - `photos`: array
    - `menuItems`: array
  - Mechanic fields:
    - `services`: array
    - `availabilityStatus`: string
  - Reviews summary:
    - `ratingAverage`: number nullable
    - `reviewCount`: integer
- Validation rules:
  - Vendor must exist and match vendorType.
- Error responses:
  - `400 INVALID_VENDOR_TYPE`
  - `404 VENDOR_NOT_FOUND`
  - `401 UNAUTHORIZED`
- Permission rules:
  - Driver role only.

### Reviews

#### 2.28 POST /api/v1/reviews
- Authentication required: Yes, driver JWT
- Request schema:
  - `vendorUserId`: uuid, required
  - `vendorType`: enum `dhaba|mechanic`, required
  - `rating`: integer, required, min 1, max 5
  - `reviewText`: string, optional, max 1000
- Response schema:
  - `id`: uuid
  - `reviewerUserId`: uuid
  - `vendorUserId`: uuid
  - `vendorType`: string
  - `rating`: integer
  - `reviewText`: string nullable
  - `createdAt`: datetime
- Validation rules:
  - Reviewer cannot review self.
  - One review per reviewer-vendor pair.
  - Vendor role must match vendorType.
- Error responses:
  - `400 VALIDATION_ERROR`
  - `409 REVIEW_ALREADY_EXISTS`
  - `404 VENDOR_NOT_FOUND`
  - `403 FORBIDDEN`
- Permission rules:
  - Driver role only.

#### 2.29 GET /api/v1/reviews
- Authentication required: Yes, driver JWT
- Request schema (query):
  - `vendorUserId`: uuid, required
  - `vendorType`: enum `dhaba|mechanic`, required
  - `page`: integer, optional, default 1
  - `pageSize`: integer, optional, default 20, max 100
- Response schema:
  - `items`: array of review objects
  - `summary`: object with `ratingAverage` and `reviewCount`
  - `pagination`: object
- Validation rules:
  - Vendor must exist.
- Error responses:
  - `400 INVALID_QUERY`
  - `404 VENDOR_NOT_FOUND`
  - `401 UNAUTHORIZED`
- Permission rules:
  - Driver role only.

## 3) OpenAPI-Style Specification

```yaml
openapi: 3.0.3
info:
  title: Highway Setu V1 API
  version: 1.0.0
servers:
  - url: /api/v1
security:
  - bearerAuth: []
components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
  schemas:
    ErrorResponse:
      type: object
      required: [code, message]
      properties:
        code:
          type: string
        message:
          type: string
        details:
          type: object
    User:
      type: object
      required: [id, phoneE164, role, verificationStatus, preferredLanguage]
      properties:
        id: { type: string, format: uuid }
        phoneE164: { type: string }
        role: { type: string, enum: [driver, dhaba_owner, mechanic_owner, admin] }
        verificationStatus: { type: string, enum: [pending, verified, rejected] }
        preferredLanguage: { type: string, enum: [english, hindi, punjabi] }
paths:
  /auth/send-otp:
    post:
      tags: [Authentication]
      security: []
      operationId: sendOtp
  /auth/verify-otp:
    post:
      tags: [Authentication]
      security: []
      operationId: verifyOtp
  /auth/refresh:
    post:
      tags: [Authentication]
      security: []
      operationId: refreshAccessToken
  /auth/logout:
    post:
      tags: [Authentication]
      operationId: logout
  /users/me:
    get:
      tags: [Users]
      operationId: getCurrentUser
  /users/me/language:
    patch:
      tags: [Users]
      operationId: updatePreferredLanguage
  /admin/users:
    get:
      tags: [Users]
      operationId: listUsersForAdmin
  /admin/users/{userId}/verification:
    patch:
      tags: [Users]
      operationId: updateUserVerification
  /driver-profiles/me:
    get:
      tags: [Driver Profiles]
      operationId: getDriverProfile
    put:
      tags: [Driver Profiles]
      operationId: updateDriverProfile
  /driver-profiles/me/truck:
    patch:
      tags: [Driver Profiles]
      operationId: updateDriverTruck
  /driver-profiles/me/journey/start:
    post:
      tags: [Driver Profiles]
      operationId: startJourney
  /driver-profiles/me/location:
    post:
      tags: [Driver Profiles]
      operationId: updateDriverLocation
  /dhaba-profiles/me:
    post:
      tags: [Dhaba Profiles]
      operationId: createDhabaProfile
    get:
      tags: [Dhaba Profiles]
      operationId: getDhabaProfile
    patch:
      tags: [Dhaba Profiles]
      operationId: updateDhabaProfile
  /dhaba-profiles/me/amenities:
    put:
      tags: [Dhaba Profiles]
      operationId: replaceDhabaAmenities
  /dhaba-profiles/me/photos:
    post:
      tags: [Dhaba Profiles]
      operationId: addDhabaPhoto
  /dhaba-profiles/me/photos/{photoId}:
    delete:
      tags: [Dhaba Profiles]
      operationId: deleteDhabaPhoto
  /dhaba-profiles/me/menu-items:
    put:
      tags: [Dhaba Profiles]
      operationId: replaceDhabaMenu
  /mechanic-profiles/me:
    post:
      tags: [Mechanic Profiles]
      operationId: createMechanicProfile
    get:
      tags: [Mechanic Profiles]
      operationId: getMechanicProfile
    patch:
      tags: [Mechanic Profiles]
      operationId: updateMechanicProfile
  /mechanic-profiles/me/services:
    put:
      tags: [Mechanic Profiles]
      operationId: replaceMechanicServices
  /mechanic-profiles/me/availability:
    patch:
      tags: [Mechanic Profiles]
      operationId: updateMechanicAvailability
  /vendors/discovery:
    get:
      tags: [Vendor Discovery]
      operationId: discoverVendors
  /vendors/{vendorType}/{vendorUserId}:
    get:
      tags: [Vendor Discovery]
      operationId: getVendorDetails
  /reviews:
    post:
      tags: [Reviews]
      operationId: createReview
    get:
      tags: [Reviews]
      operationId: listVendorReviews
```

## 4) Endpoint Dependency Map

```mermaid
graph TD
  A[POST /auth/send-otp] --> B[POST /auth/verify-otp]
  B --> C[GET /users/me]
  B --> D[Driver Endpoints]
  B --> E[Dhaba Endpoints]
  B --> F[Mechanic Endpoints]
  B --> G[Admin Endpoints]

  D --> D1[POST /driver-profiles/me/journey/start]
  D1 --> D2[POST /driver-profiles/me/location]
  D2 --> H[GET /vendors/discovery]
  H --> I[GET /vendors/{vendorType}/{vendorUserId}]
  I --> J[POST /reviews]
  I --> K[GET /reviews]

  E --> E1[PUT /dhaba-profiles/me/amenities]
  E --> E2[POST /dhaba-profiles/me/photos]
  E --> E3[PUT /dhaba-profiles/me/menu-items]

  F --> F1[PUT /mechanic-profiles/me/services]
  F --> F2[PATCH /mechanic-profiles/me/availability]

  G --> G1[GET /admin/users]
  G1 --> G2[PATCH /admin/users/{userId}/verification]
```

## 5) Module Ownership Map

| Module | Owning Backend Module | Primary Data Tables | Owning Agent |
|---|---|---|---|
| Authentication | auth | users | Backend Architect |
| Users | users and admin | users | Backend Architect and Admin Dashboard Architect |
| Driver Profiles | drivers | driver_profiles | Backend Architect |
| Dhaba Profiles | dhabas | dhaba_profiles, dhaba_amenities, dhaba_photos, dhaba_menu_items | Backend Architect |
| Mechanic Profiles | mechanics | mechanic_profiles, mechanic_services | Backend Architect |
| Vendor Discovery | vendors | dhaba_profiles, mechanic_profiles, reviews | Backend Architect and GIS Specialist |
| Reviews | reviews | reviews | Backend Architect |

## 6) API Audit Report

### Duplicate Endpoints

No duplicate endpoints detected.

Reasoning:

1. Each endpoint maps to one unique business action.
2. No pair of endpoints exposes overlapping write responsibilities for the same resource shape.

### Missing Endpoints

None for current V1 scope.

Coverage confirmation:

1. Driver: OTP, profile, truck, start journey, GPS tracking, discovery, details, distance, Google Maps handoff support data.
2. Dhaba: registration, profile, amenities, photos, menu.
3. Mechanic: registration, services, availability.
4. Admin: user verification and vendor management via user listing and verification updates.
5. Reviews: create and list for vendor details.

### Security Risks

1. OTP brute-force risk on `/auth/verify-otp`.
   - Mitigation: per-phone and per-IP rate limits with temporary lockouts.
2. Token replay risk on refresh/logout.
   - Mitigation: rotate refresh tokens and revoke on logout.
3. IDOR risk on path-identified resources.
   - Mitigation: enforce ownership checks on all `/me` writes and role checks on admin routes.
4. Review abuse risk.
   - Mitigation: one-review-per-driver-per-vendor and role checks.

### Permission Issues

No unresolved permission conflicts in contract design.

Enforced model:

1. Driver-only endpoints reject non-driver roles.
2. Dhaba endpoints reject non-dhaba roles.
3. Mechanic endpoints reject non-mechanic roles.
4. Admin endpoints accept admin role only.

### Dead Endpoints

No dead endpoints detected.

All endpoints are mapped to at least one V1 screen in API inventory.

## 7) Validation Summary

1. Every endpoint is consumed by at least one V1 screen.
2. No future, payments, SOS, ordering, loyalty, or referral endpoints are present.
3. Contract is production-ready and implementation-agnostic.
