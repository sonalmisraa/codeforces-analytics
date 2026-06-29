import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { syncLimiter } from '../middleware/rateLimiter';
import {
  createUser,
  getMe,
  updateProfile,
  getDashboardStats,
  getContestHistory,
  getDailyActivity,
  getTopicStats,
  getWeeklyProgress,
  logWeeklyHours,
  syncData,
  getLeaderboard,
  getInsights,
} from '../controllers/userController';

const router = Router();

// ─── Auth / User Routes ────────────────────────────────────────────────────────
router.post('/users', createUser);                              // POST  /api/users
router.get('/users/me', requireAuth, getMe);                   // GET   /api/users/me
router.put('/users/me/profile', requireAuth, updateProfile);   // PUT   /api/users/me/profile

// ─── Dashboard ────────────────────────────────────────────────────────────────
router.get('/dashboard/stats', requireAuth, getDashboardStats); // GET /api/dashboard/stats

// ─── Contest History ──────────────────────────────────────────────────────────
router.get('/contests', requireAuth, getContestHistory);        // GET /api/contests

// ─── Analytics ────────────────────────────────────────────────────────────────
router.get('/activity/daily', requireAuth, getDailyActivity);   // GET /api/activity/daily
router.get('/topics', requireAuth, getTopicStats);              // GET /api/topics
router.get('/progress/weekly', requireAuth, getWeeklyProgress); // GET /api/progress/weekly
router.post('/progress/hours', requireAuth, logWeeklyHours);    // POST /api/progress/hours

// ─── Sync ─────────────────────────────────────────────────────────────────────
router.post('/sync', requireAuth, syncLimiter, syncData);       // POST /api/sync

// ─── Leaderboard ──────────────────────────────────────────────────────────────
router.get('/leaderboard', getLeaderboard);                     // GET /api/leaderboard (public)

// ─── Insights ─────────────────────────────────────────────────────────────────
router.get('/insights', requireAuth, getInsights);              // GET /api/insights

export default router;
