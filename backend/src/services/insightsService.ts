import { Insight } from '../types';
import prisma from '../config/prisma';
import { getCache, setCache, CacheKeys } from '../utils/cache';

/**
 * Generate rule-based AI insights for a user
 */
export async function generateInsights(userId: string): Promise<Insight[]> {
  const cacheKey = CacheKeys.insights(userId);
  const cached = getCache<Insight[]>(cacheKey);
  if (cached) return cached;

  const insights: Insight[] = [];

  // Fetch user data
  const [profile, problemStats, dailyActivity, contestHistory] = await Promise.all([
    prisma.profile.findUnique({ where: { userId } }),
    prisma.problemStats.findMany({ where: { userId } }),
    prisma.dailyActivity.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 90,
    }),
    prisma.contestHistory.findMany({
      where: { userId },
      orderBy: { contestDate: 'desc' },
      take: 10,
    }),
  ]);

  // ─── Streak Insights ───────────────────────────────────────────────────
  if (profile) {
    if (profile.currentStreak === 0) {
      insights.push({
        id: 'streak-broken',
        type: 'warning',
        title: 'Streak Broken',
        message: `Your solving streak has ended. Start today to rebuild momentum!`,
        actionLabel: 'Find a problem',
        actionUrl: 'https://codeforces.com/problemset',
      });
    } else if (profile.currentStreak >= 7) {
      insights.push({
        id: 'streak-milestone',
        type: 'success',
        title: `${profile.currentStreak}-Day Streak 🔥`,
        message: `Incredible consistency! You've solved problems for ${profile.currentStreak} days in a row.`,
      });
    }
  }

  // ─── Topic Weakness Insights ──────────────────────────────────────────
  for (const stat of problemStats) {
    const successRate = stat.attempted > 0
      ? (stat.solved / stat.attempted) * 100
      : 0;

    if (stat.attempted >= 10 && successRate < 40) {
      insights.push({
        id: `weak-topic-${stat.topic}`,
        type: 'warning',
        title: `Low Success Rate in ${formatTopic(stat.topic)}`,
        message: `Your ${formatTopic(stat.topic)} problems have only ${Math.round(successRate)}% success rate (${stat.solved}/${stat.attempted} solved). Time to practice!`,
        topic: stat.topic,
        actionLabel: 'Practice now',
      });
    }
  }

  // ─── Topic Inactivity Insights ────────────────────────────────────────
  const recentDates = dailyActivity.map((d) => new Date(d.date));
  const topicLastSeen: Record<string, Date> = {};

  // Check which topics haven't been touched in a while
  // (In real implementation, this would track per-topic activity dates)
  for (const stat of problemStats) {
    if (stat.solved === 0 && stat.attempted > 5) {
      insights.push({
        id: `no-solve-${stat.topic}`,
        type: 'suggestion',
        title: `Unlock ${formatTopic(stat.topic)}`,
        message: `You've attempted ${stat.topic} problems but haven't solved any yet. Try easier variants first.`,
        topic: stat.topic,
      });
    }
  }

  // ─── Contest Performance Insights ────────────────────────────────────
  if (contestHistory.length >= 3) {
    const recentRatingChanges = contestHistory
      .slice(0, 5)
      .map((c) => c.ratingChange ?? 0);

    const avgChange = recentRatingChanges.reduce((a, b) => a + b, 0) / recentRatingChanges.length;

    if (avgChange < -20) {
      insights.push({
        id: 'rating-declining',
        type: 'warning',
        title: 'Rating Declining',
        message: `Your average rating change over the last ${recentRatingChanges.length} contests is ${Math.round(avgChange)}. Focus on problem-solving fundamentals.`,
      });
    } else if (avgChange > 30) {
      insights.push({
        id: 'rating-rising',
        type: 'success',
        title: 'Rating on the Rise 📈',
        message: `Excellent run! You're averaging +${Math.round(avgChange)} rating per contest recently.`,
      });
    }
  }

  // ─── Recommendation Insights ──────────────────────────────────────────
  if (profile?.codeforcesRating) {
    const rating = profile.codeforcesRating;
    let recommended = '';
    let reason = '';

    if (rating < 1200) {
      recommended = 'Implementation & Brute Force';
      reason = 'Build strong foundations with straightforward problems.';
    } else if (rating < 1400) {
      recommended = 'Greedy Algorithms';
      reason = 'Greedy is the key to Division 2 C problems.';
    } else if (rating < 1600) {
      recommended = 'Binary Search';
      reason = 'Binary Search on answer unlocks many 1400–1600 problems.';
    } else if (rating < 1900) {
      recommended = 'Dynamic Programming';
      reason = 'DP mastery is essential at this level.';
    } else {
      recommended = 'Advanced Graph Algorithms';
      reason = 'Trees, flows, and shortest paths dominate high-rated contests.';
    }

    insights.push({
      id: 'topic-recommendation',
      type: 'suggestion',
      title: `Recommended: ${recommended}`,
      message: `Based on your current rating (${rating}), focus on: ${reason}`,
      actionLabel: 'Start practicing',
    });
  }

  // ─── Activity Insights ────────────────────────────────────────────────
  const lastWeekActivity = dailyActivity
    .filter((d) => {
      const diffMs = Date.now() - new Date(d.date).getTime();
      return diffMs < 7 * 24 * 3600 * 1000;
    })
    .reduce((sum, d) => sum + d.problemsSolved, 0);

  if (lastWeekActivity === 0 && dailyActivity.length > 0) {
    insights.push({
      id: 'inactive-week',
      type: 'warning',
      title: 'No Activity This Week',
      message: 'You haven\'t solved any problems in the last 7 days. Even 1 problem a day makes a difference!',
      actionLabel: 'Start solving',
      actionUrl: 'https://codeforces.com/problemset',
    });
  } else if (lastWeekActivity >= 20) {
    insights.push({
      id: 'high-activity',
      type: 'success',
      title: 'Productive Week! 🎯',
      message: `You solved ${lastWeekActivity} problems this week. Keep the momentum!`,
    });
  }

  setCache(cacheKey, insights, 1800); // 30 min cache
  return insights;
}

function formatTopic(topic: string): string {
  return topic
    .split('_')
    .map((w) => w[0] + w.slice(1).toLowerCase())
    .join(' ');
}
