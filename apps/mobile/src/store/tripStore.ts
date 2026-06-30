import { create } from 'zustand';

export interface ActiveTrip {
  id: string;
  driverId: string;
  fromLocation: string;
  toLocation: string;
  status: 'active' | 'completed' | 'cancelled';
  startedAt: string;
  routePolyline?: string;
  distanceKm?: number;
  estimatedHours?: number;
  dhabas?: any[];
  mechanics?: any[];
}

interface TripState {
  activeTrip: ActiveTrip | null;
  setActiveTrip: (trip: ActiveTrip) => void;
  clearTrip: () => void;
}

export const useTripStore = create<TripState>((set) => ({
  activeTrip: null,
  setActiveTrip: (trip) => set({ activeTrip: trip }),
  clearTrip: () => set({ activeTrip: null }),
}));
