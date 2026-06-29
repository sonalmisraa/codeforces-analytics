import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import prisma from '../config/prisma';
import { sendSuccess, sendError, sendPaginated } from '../utils/response';
import { syncCodeforcesData, syncLeetCodeData } from '../services/syncService';
import { getCache, setCache, CacheKeys } from '../utils/cache';
import logger from '../utils/logger';

// ─── Create / Upsert User (called after Clerk signup) ─────────────────────────
export async function createUser(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { clerkId, email, name, avatar } = req.body;

    if (!clerkId || !email) {
      sendError(res, 'clerkId and email are required', 400);
      return;
    }

    const user = await prisma.user.upsert({
      where: { clerkId },
      create: { clerkId, email, name, avatar },
      update: { email, name, avatar },
    });

    sendSuccess(res, user, 'User created', 201);
  } catch (error) {
    logger.error('createUser error:', error);
    sendError(res, 'Failed to create user');
  }
}

// ─── Get Current User ──────────────────────────────────────────────────────────
export async function getMe(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: { profile: true },
    });

    if (!user) {
      sendError(res, 'User not found', 404);
      return;
    }

    sendSuccess(res, user);
  } catch (error) {
    logger.error('getMe error:', error);
    sendError(res, 'Failed to fetch user');
  }
}

// ─── Update Profile ────────────────────────────────────────────────────────────
export async function updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const {
      name, college, branch, country, githubUrl,
      linkedinUrl, bio, favoriteLanguages,
      codeforcesHandle, leetcodeUsername,
    } = req.body;

    const user = await prisma.user.update({
      where: { id: req.userId },
      data: {
        name,
        college,
        branch,
        country,
        githubUrl,
        linkedinUrl,
        bio,
        favoriteLanguages,
        codeforcesHandle,
        leetcodeUsername,
      },
      include: { profile: true },
    });

    // Trigger sync if handles changed
    if (codeforcesHandle && user.codeforcesHandle) {
      syncCodeforcesData(req.userId!, codeforcesHandle).catch(logger.error);
    }
    if (leetcodeUsername && user.leetcodeUsername) {
      syncLeetCodeData(req.userId!, leetcodeUsername).catch(logger.error);
    }

    sendSuccess(res, user, 'Profile updated');
  } catch (error) {
    logger.error('updateProfile error:', error);
    sendError(res, 'Failed to update profile');
  }
}

// ─── Get Dashboard Stats ────────────────────────────────────────────────────────
export async function getDashboardStats(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const cacheKey = CacheKeys.dashboardStats(req.userId!);
    const cached = getCache(cacheKey);
    if (cached) {
      sendSuccess(res, cached);
      return;
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: req.userId },
    });

    if (!profile) {
      sendSuccess(res, null, 'No data yet. Connect your handles to get started.');
      return;
    }

    const stats = {
      codeforcesRating: profile.codeforcesRating,
      codeforcesMaxRating: profile.codeforcesMaxRating,
      codeforcesRank: profile.codeforcesRank,
      codeforcesMaxRank: profile.codeforcesMaxRank,
      codeforcesContests: profile.codeforcesContests,
      codeforcesSolved: profile.codeforcesSolved,
      leetcodeTotalSolved: profile.leetcodeTotalSolved,
      leetcodeEasySolved: profile.leetcodeEasySolved,
      leetcodeMediumSolved: profile.leetcodeMediumSolved,
      leetcodeHardSolved: profile.leetcodeHardSolved,
      leetcodeAcceptRate: profile.leetcodeAcceptRate,
      currentStreak: profile.currentStreak,
      longestStreak: profile.longestStreak,
      totalSolved: profile.totalSolved,
      lastSyncedAt: profile.lastSyncedAt,
    };

    setCache(cacheKey, stats, 300);
    sendSuccess(res, stats);
  } catch (error) {
    logger.error('getDashboardStats error:', error);
    sendError(res, 'Failed to fetch dashboard stats');
  }
}

// ─── Get Contest History ────────────────────────────────────────────────────────
export async function getContestHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || '';
    const sortBy = (req.query.sortBy as string) || 'contestDate';
    const sortOrder = (req.query.sortOrder as string) === 'asc' ? 'asc' : 'desc';

    const where = {
      userId: req.userId,
      ...(search && {
        contestName: { contains: search, mode: 'insensitive' as const },
      }),
    };

    const [contests, total] = await Promise.all([
      prisma.contestHistory.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.contestHistory.count({ where }),
    ]);

    sendPaginated(res, contests, total, page, limit);
  } catch (error) {
    logger.error('getContestHistory error:', error);
    sendError(res, 'Failed to fetch contest history');
  }
}

// ─── Get Daily Activity (for heatmap) ─────────────────────────────────────────
export async function getDailyActivity(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const days = parseInt(req.query.days as string) || 365;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    const activity = await prisma.dailyActivity.findMany({
      where: { userId: req.userId, date: { gte: cutoff } },
      orderBy: { date: 'asc' },
    });

    sendSuccess(res, activity);
  } catch (error) {
    logger.error('getDailyActivity error:', error);
    sendError(res, 'Failed to fetch daily activity');
  }
}

// ─── Get Topic Stats ────────────────────────────────────────────────────────────
export async function getTopicStats(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const stats = await prisma.problemStats.findMany({
      where: { userId: req.userId },
    });
    sendSuccess(res, stats);
  } catch (error) {
    logger.error('getTopicStats error:', error);
    sendError(res, 'Failed to fetch topic stats');
  }
}

// ─── Get Weekly Progress ────────────────────────────────────────────────────────
export async function getWeeklyProgress(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const weeks = parseInt(req.query.weeks as string) || 12;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - weeks * 7);

    const progress = await prisma.weeklyProgress.findMany({
      where: { userId: req.userId, weekStart: { gte: cutoff } },
      orderBy: { weekStart: 'asc' },
    });

    sendSuccess(res, progress);
  } catch (error) {
    logger.error('getWeeklyProgress error:', error);
    sendError(res, 'Failed to fetch weekly progress');
  }
}

// ─── Log Weekly Hours (manual entry) ───────────────────────────────────────────
export async function logWeeklyHours(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { hours } = req.body;
    if (typeof hours !== 'number' || hours < 0) {
      sendError(res, 'Valid hours value required', 400);
      return;
    }

    const weekStart = getWeekStart(new Date());
    const progress = await prisma.weeklyProgress.upsert({
      where: { userId_weekStart: { userId: req.userId!, weekStart } },
      create: { userId: req.userId!, weekStart, hoursCoded: hours },
      update: { hoursCoded: hours },
    });

    sendSuccess(res, progress, 'Hours logged');
  } catch (error) {
    logger.error('logWeeklyHours error:', error);
    sendError(res, 'Failed to log hours');
  }
}

// ─── Sync Data ─────────────────────────────────────────────────────────────────
export async function syncData(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });

    if (!user?.codeforcesHandle && !user?.leetcodeUsername) {
      sendError(res, 'No handles connected. Update your profile first.', 400);
      return;
    }

    // Fire sync operations in background
    const syncPromises: Promise<void>[] = [];
    if (user.codeforcesHandle) {
      syncPromises.push(syncCodeforcesData(req.userId!, user.codeforcesHandle));
    }
    if (user.leetcodeUsername) {
      syncPromises.push(syncLeetCodeData(req.userId!, user.leetcodeUsername));
    }

    await Promise.all(syncPromises);
    sendSuccess(res, null, 'Data synced successfully');
  } catch (error: any) {
    logger.error('syncData error:', error);
    sendError(res, error.message || 'Sync failed');
  }
}

// ─── Get Leaderboard ────────────────────────────────────────────────────────────
export async function getLeaderboard(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const college = req.query.college as string;
    const country = req.query.country as string;

    const cacheKey = CacheKeys.leaderboard(page);
    const cached = getCache(cacheKey);
    if (cached && !college && !country) {
      sendSuccess(res, cached);
      return;
    }

    const userWhere: any = {};
    if (college) userWhere.college = { contains: college, mode: 'insensitive' };
    if (country) userWhere.country = country;

    const users = await prisma.user.findMany({
      where: userWhere,
      include: { profile: true },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.user.count({ where: userWhere });

    const leaderboard = users
      .filter((u) => u.profile)
      .map((u) => ({
        id: u.id,
        name: u.name,
        username: u.username,
        avatar: u.avatar,
        college: u.college,
        country: u.country,
        codeforcesHandle: u.codeforcesHandle,
        codeforcesRating: u.profile?.codeforcesRating,
        codeforcesRank: u.profile?.codeforcesRank,
        totalSolved: u.profile?.totalSolved ?? 0,
        currentStreak: u.profile?.currentStreak ?? 0,
        leetcodeTotalSolved: u.profile?.leetcodeTotalSolved ?? 0,
      }))
      .sort((a, b) => (b.codeforcesRating ?? 0) - (a.codeforcesRating ?? 0));

    if (!college && !country) setCache(cacheKey, leaderboard, 300);
    sendPaginated(res, leaderboard, total, page, limit);
  } catch (error) {
    logger.error('getLeaderboard error:', error);
    sendError(res, 'Failed to fetch leaderboard');
  }
}

// ─── Get Insights ──────────────────────────────────────────────────────────────
export async function getInsights(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { generateInsights } = await import('../services/insightsService');
    const insights = await generateInsights(req.userId!);
    sendSuccess(res, insights);
  } catch (error) {
    logger.error('getInsights error:', error);
    sendError(res, 'Failed to generate insights');
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}
