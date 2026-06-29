import axios from 'axios';
import { CFUser, CFRatingChange, CFSubmission } from '../types';
import { getCache, setCache, CacheKeys } from '../utils/cache';
import logger from '../utils/logger';
import { AppError } from '../middleware/errorHandler';

const CF_BASE_URL = 'https://codeforces.com/api';
const CF_TIMEOUT = 10000; // 10 seconds

const cfApi = axios.create({
  baseURL: CF_BASE_URL,
  timeout: CF_TIMEOUT,
});

/**
 * Fetch Codeforces user info
 */
export async function getCFUser(handle: string): Promise<CFUser> {
  const cacheKey = CacheKeys.cfUser(handle);
  const cached = getCache<CFUser>(cacheKey);
  if (cached) return cached;

  try {
    const { data } = await cfApi.get('/user.info', {
      params: { handles: handle },
    });

    if (data.status !== 'OK' || !data.result?.length) {
      throw new AppError(`Codeforces user "${handle}" not found`, 404);
    }

    const user: CFUser = data.result[0];
    setCache(cacheKey, user, 300); // 5 min cache
    return user;
  } catch (error: any) {
    if (error instanceof AppError) throw error;
    logger.error(`CF user fetch error for ${handle}:`, error.message);
    throw new AppError('Failed to fetch Codeforces user data', 503);
  }
}

/**
 * Fetch Codeforces rating history
 */
export async function getCFRatingHistory(handle: string): Promise<CFRatingChange[]> {
  const cacheKey = CacheKeys.cfRatings(handle);
  const cached = getCache<CFRatingChange[]>(cacheKey);
  if (cached) return cached;

  try {
    const { data } = await cfApi.get('/user.rating', {
      params: { handle },
    });

    if (data.status !== 'OK') {
      throw new AppError(`No rating history for "${handle}"`, 404);
    }

    const ratings: CFRatingChange[] = data.result || [];
    setCache(cacheKey, ratings, 600); // 10 min cache
    return ratings;
  } catch (error: any) {
    if (error instanceof AppError) throw error;
    logger.error(`CF rating history error for ${handle}:`, error.message);
    throw new AppError('Failed to fetch Codeforces rating history', 503);
  }
}

/**
 * Fetch Codeforces submissions
 */
export async function getCFSubmissions(
  handle: string,
  count: number = 10000
): Promise<CFSubmission[]> {
  const cacheKey = CacheKeys.cfSubmissions(handle);
  const cached = getCache<CFSubmission[]>(cacheKey);
  if (cached) return cached;

  try {
    const { data } = await cfApi.get('/user.status', {
      params: { handle, count },
    });

    if (data.status !== 'OK') {
      throw new AppError(`Cannot fetch submissions for "${handle}"`, 404);
    }

    const submissions: CFSubmission[] = data.result || [];
    setCache(cacheKey, submissions, 900); // 15 min cache
    return submissions;
  } catch (error: any) {
    if (error instanceof AppError) throw error;
    logger.error(`CF submissions error for ${handle}:`, error.message);
    throw new AppError('Failed to fetch Codeforces submissions', 503);
  }
}

/**
 * Derive topic breakdown from submissions
 */
export function deriveTopicStats(submissions: CFSubmission[]): Record<string, { solved: number; attempted: number }> {
  const accepted = new Set<string>();
  const attempted = new Set<string>();
  const topicStats: Record<string, { solved: number; attempted: number }> = {};

  const TAG_MAP: Record<string, string> = {
    greedy: 'GREEDY',
    dp: 'DP',
    'dynamic programming': 'DP',
    graphs: 'GRAPHS',
    dfs: 'GRAPHS',
    bfs: 'GRAPHS',
    trees: 'TREES',
    'binary search': 'BINARY_SEARCH',
    math: 'MATH',
    'number theory': 'NUMBER_THEORY',
    implementation: 'IMPLEMENTATION',
    strings: 'STRINGS',
    'data structures': 'DATA_STRUCTURES',
    geometry: 'GEOMETRY',
    sorting: 'SORTING',
  };

  for (const sub of submissions) {
    const problemKey = `${sub.problem.contestId}-${sub.problem.index}`;
    const isAC = sub.verdict === 'OK';

    if (!attempted.has(problemKey)) attempted.add(problemKey);
    if (isAC && !accepted.has(problemKey)) accepted.add(problemKey);

    for (const tag of sub.problem.tags) {
      const normalizedTag = TAG_MAP[tag.toLowerCase()];
      if (!normalizedTag) continue;

      if (!topicStats[normalizedTag]) {
        topicStats[normalizedTag] = { solved: 0, attempted: 0 };
      }
    }
  }

  // Second pass: count per topic
  const topicSolved: Record<string, Set<string>> = {};
  const topicAttempted: Record<string, Set<string>> = {};

  for (const sub of submissions) {
    const problemKey = `${sub.problem.contestId}-${sub.problem.index}`;
    const isAC = sub.verdict === 'OK';

    for (const tag of sub.problem.tags) {
      const normalizedTag = TAG_MAP[tag.toLowerCase()];
      if (!normalizedTag) continue;

      if (!topicAttempted[normalizedTag]) topicAttempted[normalizedTag] = new Set();
      if (!topicSolved[normalizedTag]) topicSolved[normalizedTag] = new Set();

      topicAttempted[normalizedTag].add(problemKey);
      if (isAC) topicSolved[normalizedTag].add(problemKey);
    }
  }

  const result: Record<string, { solved: number; attempted: number }> = {};
  for (const topic of Object.keys(topicAttempted)) {
    result[topic] = {
      solved: topicSolved[topic]?.size ?? 0,
      attempted: topicAttempted[topic].size,
    };
  }

  return result;
}

/**
 * Derive daily activity from submissions (last 365 days)
 */
export function deriveDailyActivity(
  submissions: CFSubmission[]
): Record<string, number> {
  const daily: Record<string, number> = {};
  const solvedProblems = new Set<string>();
  const cutoff = Date.now() / 1000 - 365 * 24 * 3600;

  const acSubmissions = submissions
    .filter((s) => s.verdict === 'OK' && s.creationTimeSeconds > cutoff)
    .sort((a, b) => a.creationTimeSeconds - b.creationTimeSeconds);

  for (const sub of acSubmissions) {
    const key = `${sub.problem.contestId}-${sub.problem.index}`;
    if (solvedProblems.has(key)) continue;
    solvedProblems.add(key);

    const date = new Date(sub.creationTimeSeconds * 1000)
      .toISOString()
      .split('T')[0];
    daily[date] = (daily[date] ?? 0) + 1;
  }

  return daily;
}
