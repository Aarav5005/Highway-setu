import { apiClient } from './client';

export const tripsApi = {
  startTrip: (from: string, to: string, fromCoords: {lat: number, lng: number}, toCoords: {lat: number, lng: number}) =>
    apiClient.post('/trips/start', {
      from_location: from,
      to_location: to,
      from_lat: fromCoords.lat,
      from_lng: fromCoords.lng,
      to_lat: toCoords.lat,
      to_lng: toCoords.lng,
    }),

  updateLocation: (tripId: string, lat: number, lng: number) =>
    apiClient.post(`/trips/${tripId}/location`, { lat, lng }),

  endTrip: (tripId: string) =>
    apiClient.post(`/trips/${tripId}/end`),

  getTripHistory: () =>
    apiClient.get('/trips/history'),

  getActiveTrip: () =>
    apiClient.get('/trips/active'),
};
