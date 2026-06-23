import { create } from 'zustand';

export interface User {
  id: string;
  phone: string;
  role: 'driver' | 'dhaba_owner' | 'mechanic' | 'admin' | null;
  name?: string;
  language_pref: string;
  fcm_token?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  setLanguage: (lang: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  setUser: (user) => set({ user, isAuthenticated: true }),
  setToken: (token) => set({ token }),
  setLanguage: (lang) => set((state) => ({ user: state.user ? { ...state.user, language_pref: lang } : null })),
  logout: () => set({ user: null, token: null, isAuthenticated: false }),
}));
