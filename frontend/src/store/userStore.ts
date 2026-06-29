import { create } from 'zustand';
import { User, DashboardStats } from '@/types';

interface UserStore {
  user: User | null;
  dashboardStats: DashboardStats | null;
  isSyncing: boolean;
  lastSynced: Date | null;

  setUser: (user: User | null) => void;
  setDashboardStats: (stats: DashboardStats | null) => void;
  setIsSyncing: (v: boolean) => void;
  setLastSynced: (date: Date | null) => void;
  clearStore: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  dashboardStats: null,
  isSyncing: false,
  lastSynced: null,

  setUser: (user) => set({ user }),
  setDashboardStats: (dashboardStats) => set({ dashboardStats }),
  setIsSyncing: (isSyncing) => set({ isSyncing }),
  setLastSynced: (lastSynced) => set({ lastSynced }),
  clearStore: () => set({
    user: null,
    dashboardStats: null,
    isSyncing: false,
    lastSynced: null,
  }),
}));
