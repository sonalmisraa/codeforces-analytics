import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import {
  ApiResponse, DashboardStats, User, Contest,
  DailyActivity, TopicStat, WeeklyProgress, Insight, LeaderboardUser
} from '@/types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// ─── Axios Instance ────────────────────────────────────────────────────────────
export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Token injector — gets current Clerk session token
let getTokenFn: (() => Promise<string | null>) | null = null;

export function setTokenProvider(fn: () => Promise<string | null>) {
  getTokenFn = fn;
}

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  if (getTokenFn) {
    const token = await getTokenFn();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiResponse>) => {
    const message = error.response?.data?.error || error.message;
    return Promise.reject(new Error(message));
  }
);

// ─── User APIs ────────────────────────────────────────────────────────────────
export const userApi = {
  create: (data: { clerkId: string; email: string; name?: string; avatar?: string }) =>
    api.post<ApiResponse<User>>('/users', data),

  getMe: () => api.get<ApiResponse<User>>('/users/me'),

  updateProfile: (data: Partial<User>) =>
    api.put<ApiResponse<User>>('/users/me/profile', data),
};

// ─── Dashboard APIs ───────────────────────────────────────────────────────────
export const dashboardApi = {
  getStats: () => api.get<ApiResponse<DashboardStats>>('/dashboard/stats'),
};

// ─── Contest APIs ──────────────────────────────────────────────────────────────
export const contestApi = {
  getHistory: (params: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => api.get<ApiResponse<Contest[]>>('/contests', { params }),
};

// ─── Activity APIs ─────────────────────────────────────────────────────────────
export const activityApi = {
  getDaily: (days?: number) =>
    api.get<ApiResponse<DailyActivity[]>>('/activity/daily', { params: { days } }),

  getTopics: () => api.get<ApiResponse<TopicStat[]>>('/topics'),

  getWeeklyProgress: (weeks?: number) =>
    api.get<ApiResponse<WeeklyProgress[]>>('/progress/weekly', { params: { weeks } }),

  logHours: (hours: number) =>
    api.post<ApiResponse<WeeklyProgress>>('/progress/hours', { hours }),
};

// ─── Sync API ─────────────────────────────────────────────────────────────────
export const syncApi = {
  sync: () => api.post<ApiResponse<null>>('/sync'),
};

// ─── Leaderboard API ──────────────────────────────────────────────────────────
export const leaderboardApi = {
  get: (params: { page?: number; limit?: number; college?: string; country?: string }) =>
    api.get<ApiResponse<LeaderboardUser[]>>('/leaderboard', { params }),
};

// ─── Insights API ─────────────────────────────────────────────────────────────
export const insightsApi = {
  get: () => api.get<ApiResponse<Insight[]>>('/insights'),
};
