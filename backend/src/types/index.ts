import { Request } from 'express';

// ─── Auth ────────────────────────────────────────────────────────────────────
export interface AuthenticatedRequest extends Request {
  userId?: string;
  clerkId?: string;
}

// ─── API Response ─────────────────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ─── Codeforces API ───────────────────────────────────────────────────────────
export interface CFUser {
  handle: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  country?: string;
  city?: string;
  organization?: string;
  contribution: number;
  rank: string;
  rating: number;
  maxRank: string;
  maxRating: number;
  lastOnlineTimeSeconds: number;
  registrationTimeSeconds: number;
  friendOfCount: number;
  avatar: string;
  titlePhoto: string;
}

export interface CFRatingChange {
  contestId: number;
  contestName: string;
  handle: string;
  rank: number;
  ratingUpdateTimeSeconds: number;
  oldRating: number;
  newRating: number;
}

export interface CFSubmission {
  id: number;
  contestId?: number;
  creationTimeSeconds: number;
  relativeTimeSeconds: number;
  problem: {
    contestId?: number;
    index: string;
    name: string;
    type: string;
    rating?: number;
    tags: string[];
  };
  author: {
    contestId?: number;
    members: Array<{ handle: string }>;
    participantType: string;
    ghost: boolean;
    startTimeSeconds?: number;
  };
  programmingLanguage: string;
  verdict?: string;
  testset: string;
  passedTestCount: number;
  timeConsumedMillis: number;
  memoryConsumedBytes: number;
}

// ─── LeetCode API ─────────────────────────────────────────────────────────────
export interface LCUserStats {
  totalSolved: number;
  totalSubmissions: number;
  totalQuestions: number;
  easySolved: number;
  totalEasy: number;
  mediumSolved: number;
  totalMedium: number;
  hardSolved: number;
  totalHard: number;
  ranking: number;
  contributionPoints: number;
  reputation: number;
  acceptanceRate: number;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export interface DashboardStats {
  codeforcesRating: number | null;
  codeforcesMaxRating: number | null;
  codeforcesMaxRank: string | null;
  codeforcesRank: string | null;
  codeforcesContests: number | null;
  codeforcesSolved: number | null;
  leetcodeTotalSolved: number | null;
  leetcodeEasySolved: number | null;
  leetcodeMediumSolved: number | null;
  leetcodeHardSolved: number | null;
  leetcodeAcceptRate: number | null;
  currentStreak: number;
  longestStreak: number;
  totalSolved: number;
}

// ─── Insights ─────────────────────────────────────────────────────────────────
export interface Insight {
  id: string;
  type: 'warning' | 'success' | 'suggestion' | 'info';
  title: string;
  message: string;
  topic?: string;
  actionLabel?: string;
  actionUrl?: string;
}
