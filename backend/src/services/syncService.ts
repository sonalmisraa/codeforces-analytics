import prisma from '../config/prisma';
import { getCFUser, getCFRatingHistory, getCFSubmissions, deriveTopicStats, deriveDailyActivity } from './codeforcesService';
import { getLCUserStats } from './leetcodeService';
import { deleteCachePattern } from '../utils/cache';
import logger from '../utils/logger';

/**
 * Sync all Codeforces data for a user
 */
export async function syncCodeforcesData(userId: string, handle: string): Promise<void> {
  logger.info(`Syncing CF data for user ${userId}, handle: ${handle}`);

  const [cfUser, cfRatings, cfSubmissions] = await Promise.all([
    getCFUser(handle),
    getCFRatingHistory(handle),
    getCFSubmissions(handle),
  ]);

  // Derive topic stats and daily activity from submissions
  const topicStats = deriveTopicStats(cfSubmissions);
  const dailyActivity = deriveDailyActivity(cfSubmissions);

  // Count unique accepted problems
  const acceptedProblems = new Set<string>();
  for (const sub of cfSubmissions) {
    if (sub.verdict === 'OK') {
      acceptedProblems.add(`${sub.problem.contestId}-${sub.problem.index}`);
    }
  }

  // Update profile
  await prisma.profile.upsert({
    where: { userId },
    create: {
      userId,
      codeforcesRating: cfUser.rating,
      codeforcesMaxRating: cfUser.maxRating,
      codeforcesRank: cfUser.rank,
      codeforcesMaxRank: cfUser.maxRank,
      codeforcesContests: cfRatings.length,
      codeforcesSolved: acceptedProblems.size,
      lastSyncedAt: new Date(),
    },
    update: {
      codeforcesRating: cfUser.rating,
      codeforcesMaxRating: cfUser.maxRating,
      codeforcesRank: cfUser.rank,
      codeforcesMaxRank: cfUser.maxRank,
      codeforcesContests: cfRatings.length,
      codeforcesSolved: acceptedProblems.size,
      lastSyncedAt: new Date(),
    },
  });

  // Upsert contest history
  for (const rating of cfRatings) {
    await prisma.contestHistory.upsert({
      where: {
        userId_contestId_platform: {
          userId,
          contestId: rating.contestId,
          platform: 'CODEFORCES',
        },
      },
      create: {
        userId,
        contestId: rating.contestId,
        contestName: rating.contestName,
        platform: 'CODEFORCES',
        rank: rating.rank,
        oldRating: rating.oldRating,
        newRating: rating.newRating,
        ratingChange: rating.newRating - rating.oldRating,
        contestDate: new Date(rating.ratingUpdateTimeSeconds * 1000),
      },
      update: {
        contestName: rating.contestName,
        rank: rating.rank,
        oldRating: rating.oldRating,
        newRating: rating.newRating,
        ratingChange: rating.newRating - rating.oldRating,
      },
    });
  }

  // Upsert topic stats
  for (const [topic, stats] of Object.entries(topicStats)) {
    await prisma.problemStats.upsert({
      where: {
        userId_topic_platform: {
          userId,
          topic: topic as any,
          platform: 'CODEFORCES',
        },
      },
      create: {
        userId,
        topic: topic as any,
        platform: 'CODEFORCES',
        solved: stats.solved,
        attempted: stats.attempted,
      },
      update: {
        solved: stats.solved,
        attempted: stats.attempted,
      },
    });
  }

  // Upsert daily activity
  for (const [dateStr, count] of Object.entries(dailyActivity)) {
    const date = new Date(dateStr);
    await prisma.dailyActivity.upsert({
      where: { userId_date: { userId, date } },
      create: { userId, date, problemsSolved: count },
      update: { problemsSolved: count },
    });
  }

  // Compute streaks
  const { currentStreak, longestStreak } = computeStreaks(dailyActivity);

  await prisma.profile.update({
    where: { userId },
    data: {
      currentStreak,
      longestStreak,
      totalSolved: acceptedProblems.size,
    },
  });

  // Invalidate caches
  deleteCachePattern(`dashboard:${userId}`);
  deleteCachePattern(`insights:${userId}`);
  deleteCachePattern(`contests:${userId}`);

  logger.info(`CF sync complete for user ${userId}`);
}

/**
 * Sync LeetCode data for a user
 */
export async function syncLeetCodeData(userId: string, username: string): Promise<void> {
  logger.info(`Syncing LC data for user ${userId}, username: ${username}`);

  const lcStats = await getLCUserStats(username);

  await prisma.profile.upsert({
    where: { userId },
    create: {
      userId,
      leetcodeTotalSolved: lcStats.totalSolved,
      leetcodeEasySolved: lcStats.easySolved,
      leetcodeMediumSolved: lcStats.mediumSolved,
      leetcodeHardSolved: lcStats.hardSolved,
      leetcodeAcceptRate: lcStats.acceptanceRate,
      lastSyncedAt: new Date(),
    },
    update: {
      leetcodeTotalSolved: lcStats.totalSolved,
      leetcodeEasySolved: lcStats.easySolved,
      leetcodeMediumSolved: lcStats.mediumSolved,
      leetcodeHardSolved: lcStats.hardSolved,
      leetcodeAcceptRate: lcStats.acceptanceRate,
      lastSyncedAt: new Date(),
    },
  });

  deleteCachePattern(`dashboard:${userId}`);
  logger.info(`LC sync complete for user ${userId}`);
}

/**
 * Compute current and longest streak from daily activity map
 */
function computeStreaks(
  dailyActivity: Record<string, number>
): { currentStreak: number; longestStreak: number } {
  const dates = Object.keys(dailyActivity)
    .filter((d) => (dailyActivity[d] ?? 0) > 0)
    .sort()
    .reverse();

  if (!dates.length) return { currentStreak: 0, longestStreak: 0 };

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  let currentStreak = 0;
  if (dates[0] === today || dates[0] === yesterday) {
    let prev = new Date(dates[0]);
    currentStreak = 1;
    for (let i = 1; i < dates.length; i++) {
      const curr = new Date(dates[i]);
      const diff = Math.round((prev.getTime() - curr.getTime()) / 86400000);
      if (diff === 1) {
        currentStreak++;
        prev = curr;
      } else {
        break;
      }
    }
  }

  let longestStreak = 0;
  let streak = 1;
  const sortedDates = [...dates].reverse();
  for (let i = 1; i < sortedDates.length; i++) {
    const curr = new Date(sortedDates[i]);
    const prev = new Date(sortedDates[i - 1]);
    const diff = Math.round((curr.getTime() - prev.getTime()) / 86400000);
    if (diff === 1) {
      streak++;
      longestStreak = Math.max(longestStreak, streak);
    } else {
      streak = 1;
    }
  }

  return { currentStreak, longestStreak: Math.max(longestStreak, currentStreak) };
}
