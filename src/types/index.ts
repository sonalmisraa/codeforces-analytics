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

// ─── User ─────────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  clerkId: string;
  email: string;
  username?: string;
  name?: string;
  avatar?: string;
  college?: string;
  branch?: string;
  country?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  resumeUrl?: string;
  bio?: string;
  favoriteLanguages: string[];
  codeforcesHandle?: string;
  leetcodeUsername?: string;
  profile?: Profile;
  createdAt: string;
}

// ─── Profile ──────────────────────────────────────────────────────────────────
export interface Profile {
  id: string;
  userId: string;
  codeforcesRating?: number;
  codeforcesMaxRating?: number;
  codeforcesRank?: string;
  codeforcesMaxRank?: string;
  codeforcesContests?: number;
  codeforcesSolved?: number;
  leetcodeTotalSolved?: number;
  leetcodeEasySolved?: number;
  leetcodeMediumSolved?: number;
  leetcodeHardSolved?: number;
  leetcodeAcceptRate?: number;
  currentStreak: number;
  longestStreak: number;
  totalSolved: number;
  lastSyncedAt?: string;
}

// ─── Dashboard Stats ──────────────────────────────────────────────────────────
export interface DashboardStats {
  codeforcesRating?: number;
  codeforcesMaxRating?: number;
  codeforcesRank?: string;
  codeforcesMaxRank?: string;
  codeforcesContests?: number;
  codeforcesSolved?: number;
  leetcodeTotalSolved?: number;
  leetcodeEasySolved?: number;
  leetcodeMediumSolved?: number;
  leetcodeHardSolved?: number;
  leetcodeAcceptRate?: number;
  currentStreak: number;
  longestStreak: number;
  totalSolved: number;
  lastSyncedAt?: string;
}

// ─── Contest History ──────────────────────────────────────────────────────────
export interface Contest {
  id: string;
  contestId: number;
  contestName: string;
  platform: 'CODEFORCES' | 'LEETCODE';
  rank?: number;
  oldRating?: number;
  newRating?: number;
  ratingChange?: number;
  problemsSolved?: number;
  contestDate: string;
}

// ─── Daily Activity ───────────────────────────────────────────────────────────
export interface DailyActivity {
  id: string;
  date: string;
  problemsSolved: number;
  minutesCoded: number;
}

// ─── Topic Stats ──────────────────────────────────────────────────────────────
export interface TopicStat {
  id: string;
  topic: ProblemTopic;
  solved: number;
  attempted: number;
  platform: string;
}

export type ProblemTopic =
  | 'GREEDY'
  | 'DP'
  | 'GRAPHS'
  | 'TREES'
  | 'BINARY_SEARCH'
  | 'MATH'
  | 'IMPLEMENTATION'
  | 'STRINGS'
  | 'DATA_STRUCTURES'
  | 'NUMBER_THEORY'
  | 'GEOMETRY'
  | 'SORTING';

// ─── Weekly Progress ──────────────────────────────────────────────────────────
export interface WeeklyProgress {
  id: string;
  weekStart: string;
  problemsSolved: number;
  hoursCoded: number;
  contestsGiven: number;
}

// ─── Insight ──────────────────────────────────────────────────────────────────
export interface Insight {
  id: string;
  type: 'warning' | 'success' | 'suggestion' | 'info';
  title: string;
  message: string;
  topic?: string;
  actionLabel?: string;
  actionUrl?: string;
}

// ─── Leaderboard User ─────────────────────────────────────────────────────────
export interface LeaderboardUser {
  id: string;
  name?: string;
  username?: string;
  avatar?: string;
  college?: string;
  country?: string;
  codeforcesHandle?: string;
  codeforcesRating?: number;
  codeforcesRank?: string;
  totalSolved: number;
  currentStreak: number;
  leetcodeTotalSolved?: number;
}

// ─── CF Rating (for graph) ────────────────────────────────────────────────────
export interface RatingPoint {
  contestId: number;
  contestName: string;
  contestDate: string;
  oldRating: number;
  newRating: number;
  ratingChange: number;
  rank: number;
}
