'use client';

import { useUser } from '@clerk/nextjs';
import {
  Code2, Trophy, Target, Flame, TrendingUp,
  CheckCircle, Zap, Clock, BarChart3, Star
} from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { SectionCard } from '@/components/shared/SectionCard';
import { RatingGraph } from '@/components/charts/RatingGraph';
import { StatCardSkeleton, ChartSkeleton } from '@/components/shared/Skeleton';
import { ActivityHeatmap } from '@/components/charts/ActivityHeatmap';
import { EmptyState } from '@/components/shared/EmptyState';
import { useApi } from '@/hooks/useApi';
import { dashboardApi, contestApi, activityApi } from '@/services/api';
import { getCFRankColor, formatRelativeTime } from '@/lib/utils';
import Link from 'next/link';
import type { Route } from 'next';
import { ArrowRight, RefreshCw } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useUser();

  const { data: stats, loading: statsLoading } = useApi(
    () => dashboardApi.getStats(),
    []
  );
  const { data: contests, loading: contestsLoading } = useApi(
    () => contestApi.getHistory({ limit: 50 }),
    []
  );
  const { data: activity, loading: activityLoading } = useApi(
    () => activityApi.getDaily(365),
    []
  );

  const hasData = !!stats;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            Welcome back, {user?.firstName ?? 'Coder'} 👋
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {stats?.lastSyncedAt
              ? `Last synced ${formatRelativeTime(stats.lastSyncedAt)}`
              : 'Connect your handles to start tracking'}
          </p>
        </div>
        <Link
          href="/dashboard/profile"
          className="flex items-center gap-2 text-sm border border-border hover:border-brand-500/50 px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Connect handles
        </Link>
      </div>

      {/* No data CTA */}
      {!statsLoading && !hasData && (
        <div className="rounded-xl border border-dashed border-brand-500/30 bg-brand-500/5 p-8 text-center">
          <div className="w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center mx-auto mb-3">
            <Code2 className="w-6 h-6 text-brand-500" />
          </div>
          <h3 className="font-semibold mb-1.5">No data yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Connect your Codeforces and LeetCode handles to populate your dashboard.
          </p>
          <Link
            href="/dashboard/profile"
            className="inline-flex items-center gap-1.5 bg-brand-500 hover:bg-brand-600 text-white text-sm px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Set up profile <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Stat cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading ? (
          Array.from({ length: 8 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard
              title="CF Rating"
              value={stats?.codeforcesRating ?? null}
              subtitle={stats?.codeforcesRank ?? 'Not ranked'}
              icon={TrendingUp}
              iconColor="text-brand-500"
              iconBg="bg-brand-500/10"
              badge={stats?.codeforcesRank}
              badgeColor="bg-brand-500/10 text-brand-500"
            />
            <StatCard
              title="Max Rating"
              value={stats?.codeforcesMaxRating ?? null}
              subtitle={stats?.codeforcesMaxRank ?? '—'}
              icon={Star}
              iconColor="text-yellow-500"
              iconBg="bg-yellow-500/10"
            />
            <StatCard
              title="Contests"
              value={stats?.codeforcesContests ?? null}
              subtitle="Codeforces contests"
              icon={Trophy}
              iconColor="text-orange-500"
              iconBg="bg-orange-500/10"
            />
            <StatCard
              title="CF Solved"
              value={stats?.codeforcesSolved ?? null}
              subtitle="Unique problems"
              icon={Code2}
              iconColor="text-cyan-500"
              iconBg="bg-cyan-500/10"
            />
            <StatCard
              title="LC Total"
              value={stats?.leetcodeTotalSolved ?? null}
              subtitle={
                stats?.leetcodeAcceptRate
                  ? `${stats.leetcodeAcceptRate}% acceptance`
                  : 'LeetCode'
              }
              icon={CheckCircle}
              iconColor="text-green-500"
              iconBg="bg-green-500/10"
            />
            <StatCard
              title="LC Easy / Med / Hard"
              value={
                stats?.leetcodeEasySolved != null
                  ? `${stats.leetcodeEasySolved}/${stats.leetcodeMediumSolved}/${stats.leetcodeHardSolved}`
                  : null
              }
              subtitle="Easy / Medium / Hard"
              icon={Target}
              iconColor="text-purple-500"
              iconBg="bg-purple-500/10"
              animate={false}
            />
            <StatCard
              title="Current Streak"
              value={stats?.currentStreak ?? 0}
              subtitle="days in a row"
              icon={Flame}
              iconColor="text-red-500"
              iconBg="bg-red-500/10"
              badge={stats?.currentStreak ? `🔥 Active` : undefined}
            />
            <StatCard
              title="Longest Streak"
              value={stats?.longestStreak ?? 0}
              subtitle="personal best"
              icon={Zap}
              iconColor="text-amber-500"
              iconBg="bg-amber-500/10"
            />
          </>
        )}
      </div>

      {/* Rating graph */}
      <SectionCard
        title="Rating History"
        subtitle="Codeforces rating progression"
        icon={BarChart3}
        action={
          <Link
            href="/dashboard/rating"
            className="text-xs text-brand-500 hover:text-brand-400 flex items-center gap-1"
          >
            Full view <ArrowRight className="w-3 h-3" />
          </Link>
        }
      >
        {contestsLoading ? (
          <div className="h-72 skeleton rounded-lg" />
        ) : (
          <RatingGraph contests={contests ?? []} />
        )}
      </SectionCard>

      {/* Activity heatmap */}
      <SectionCard
        title="Activity Heatmap"
        subtitle="Daily problems solved (last 12 months)"
        icon={Zap}
        action={
          <Link
            href="/dashboard/heatmap"
            className="text-xs text-brand-500 hover:text-brand-400 flex items-center gap-1"
          >
            Full view <ArrowRight className="w-3 h-3" />
          </Link>
        }
      >
        {activityLoading ? (
          <div className="h-32 skeleton rounded-lg" />
        ) : (
          <ActivityHeatmap activities={activity ?? []} />
        )}
      </SectionCard>

      {/* Quick links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { href: '/dashboard/contests', label: 'Contest History', icon: Trophy },
          { href: '/dashboard/topics', label: 'Topic Analytics', icon: Code2 },
          { href: '/dashboard/insights', label: 'AI Insights', icon: Zap },
          { href: '/dashboard/leaderboard', label: 'Leaderboard', icon: TrendingUp },
        ].map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href as Route}
            className="group flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:border-brand-500/40 hover:bg-brand-500/5 transition-all duration-200"
          >
            <Icon className="w-4 h-4 text-muted-foreground group-hover:text-brand-500 transition-colors" />
            <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
              {label}
            </span>
            <ArrowRight className="w-3.5 h-3.5 ml-auto text-muted-foreground/50 group-hover:text-brand-500 group-hover:translate-x-0.5 transition-all" />
          </Link>
        ))}
      </div>
    </div>
  );
}
