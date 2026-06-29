import axios from 'axios';
import { LCUserStats } from '../types';
import { getCache, setCache, CacheKeys } from '../utils/cache';
import logger from '../utils/logger';
import { AppError } from '../middleware/errorHandler';

const LC_BASE_URL = 'https://leetcode.com';
const LC_TIMEOUT = 12000;

/**
 * Fetch LeetCode user statistics using the GraphQL API
 */
export async function getLCUserStats(username: string): Promise<LCUserStats> {
  const cacheKey = CacheKeys.lcStats(username);
  const cached = getCache<LCUserStats>(cacheKey);
  if (cached) return cached;

  try {
    // LeetCode GraphQL API
    const query = `
      query getUserProfile($username: String!) {
        matchedUser(username: $username) {
          username
          submitStats: submitStatsGlobal {
            acSubmissionNum {
              difficulty
              count
              submissions
            }
            totalSubmissionNum {
              difficulty
              count
              submissions
            }
          }
          profile {
            ranking
            reputation
          }
        }
      }
    `;

    const { data } = await axios.post(
      `${LC_BASE_URL}/graphql`,
      { query, variables: { username } },
      {
        timeout: LC_TIMEOUT,
        headers: {
          'Content-Type': 'application/json',
          Referer: 'https://leetcode.com',
        },
      }
    );

    if (!data?.data?.matchedUser) {
      throw new AppError(`LeetCode user "${username}" not found`, 404);
    }

    const user = data.data.matchedUser;
    const acStats = user.submitStats.acSubmissionNum;
    const totalStats = user.submitStats.totalSubmissionNum;

    const getCount = (arr: any[], difficulty: string) =>
      arr.find((s: any) => s.difficulty === difficulty)?.count ?? 0;

    const getTotalSubmissions = (arr: any[], difficulty: string) =>
      arr.find((s: any) => s.difficulty === difficulty)?.submissions ?? 0;

    const totalSolved = getCount(acStats, 'All');
    const totalSubmissions = getTotalSubmissions(totalStats, 'All');
    const acceptanceRate = totalSubmissions > 0
      ? Math.round((totalSolved / totalSubmissions) * 10000) / 100
      : 0;

    const stats: LCUserStats = {
      totalSolved,
      totalSubmissions,
      totalQuestions: 3000, // approximate
      easySolved: getCount(acStats, 'Easy'),
      totalEasy: 800,
      mediumSolved: getCount(acStats, 'Medium'),
      totalMedium: 1600,
      hardSolved: getCount(acStats, 'Hard'),
      totalHard: 600,
      ranking: user.profile?.ranking ?? 0,
      contributionPoints: 0,
      reputation: user.profile?.reputation ?? 0,
      acceptanceRate,
    };

    setCache(cacheKey, stats, 600);
    return stats;
  } catch (error: any) {
    if (error instanceof AppError) throw error;
    logger.error(`LC stats error for ${username}:`, error.message);
    throw new AppError('Failed to fetch LeetCode stats', 503);
  }
}
