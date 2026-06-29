'use client';

import { BarChart3, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { SectionCard } from '@/components/shared/SectionCard';
import { RatingGraph } from '@/components/charts/RatingGraph';
import { ChartSkeleton } from '@/components/shared/Skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { useApi } from '@/hooks/useApi';
import { contestApi, dashboardApi } from '@/services/api';
import { formatDate, formatRatingChange, getCFRankColor } from '@/lib/utils';
import { cn } from '@/lib/utils';

export default function RatingPage() {
  const { data: contests, loading: contestsLoading } = useApi(
    () => contestApi.getHistory({ limit: 200, sortBy: 'contestDate', sortOrder: 'asc' }),
    []
  );
  const { data: stats } = useApi(() => dashboardApi.getStats(), []);

  const contestList = contests ?? [];

  // Stats derived from contest list
  const ratingChanges = contestList.map((c) => c.ratingChange ?? 0);
  const bestContest = contestList.reduce<typeof contestList[0] | null>((best, c) => {
    if (!best) return c;
    return (c.ratingChange ?? -Infinity) > (best.ratingChange ?? -Infinity) ? c : best;
  }, null);
  const worstContest = contestList.reduce<typeof contestList[0] | null>((worst, c) => {
    if (!worst) return c;
    return (c.ratingChange ?? Infinity) < (worst.ratingChange ?? Infinity) ? c : worst;
  }, null);

  const positiveCount = ratingChanges.filter((r) => r > 0).length;
  const winRate = contestList.length ? Math.round((positiveCount / contestList.length) * 100) : 0;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Rating History</h1>
        <p className="text-muted-foreground text-sm mt-1">Your Codeforces rating progression over all contests</p>
      </div>

      {/* Current rating strip */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: 'Current Rating',
              value: stats.codeforcesRating ?? '—',
              sub: stats.codeforcesRank ?? '',
              color: 'text-brand-500',
            },
            {
              label: 'Peak Rating',
              value: stats.codeforcesMaxRating ?? '—',
              sub: stats.codeforcesMaxRank ?? '',
              color: 'text-yellow-500',
            },
            {
              label: 'Win Rate',
              value: `${winRate}%`,
              sub: `${positiveCount}/${contestList.length} contests`,
              color: 'text-green-500',
            },
            {
              label: 'Contests',
              value: stats.codeforcesContests ?? 0,
              sub: 'total participated',
              color: 'text-purple-500',
            },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-border bg-card p-5">
              <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
              <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{item.sub}</p>
            </div>
          ))}
        </div>
      )}

      {/* Main chart */}
      <SectionCard title="Rating Graph" subtitle="All-time progression" icon={BarChart3}>
        {contestsLoading ? (
          <div className="h-80 skeleton rounded-lg" />
        ) : contestList.length === 0 ? (
          <EmptyState
            icon={BarChart3}
            title="No rating history"
            description="Sync your Codeforces handle to see your rating progression."
            actionLabel="Go to Profile"
            actionHref="/dashboard/profile"
          />
        ) : (
          <RatingGraph contests={contestList} />
        )}
      </SectionCard>

      {/* Notable contests */}
      {!contestsLoading && contestList.length > 0 && (
        <div className="grid md:grid-cols-2 gap-4">
          {bestContest && (
            <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-5">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-sm font-semibold text-green-500">Best Performance</span>
              </div>
              <p className="font-medium text-sm mb-1 line-clamp-1">{bestContest.contestName}</p>
              <p className="text-xs text-muted-foreground mb-2">{formatDate(bestContest.contestDate)}</p>
              <div className="flex items-center gap-3 text-sm">
                <span className="font-bold text-green-500 text-lg">
                  {formatRatingChange(bestContest.ratingChange ?? 0)}
                </span>
                <span className="text-muted-foreground">
                  {bestContest.oldRating} → {bestContest.newRating}
                </span>
                <span className="text-muted-foreground">Rank #{bestContest.rank}</span>
              </div>
            </div>
          )}
          {worstContest && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5">
              <div className="flex items-center gap-2 mb-3">
                <TrendingDown className="w-4 h-4 text-red-500" />
                <span className="text-sm font-semibold text-red-500">Toughest Contest</span>
              </div>
              <p className="font-medium text-sm mb-1 line-clamp-1">{worstContest.contestName}</p>
              <p className="text-xs text-muted-foreground mb-2">{formatDate(worstContest.contestDate)}</p>
              <div className="flex items-center gap-3 text-sm">
                <span className="font-bold text-red-500 text-lg">
                  {formatRatingChange(worstContest.ratingChange ?? 0)}
                </span>
                <span className="text-muted-foreground">
                  {worstContest.oldRating} → {worstContest.newRating}
                </span>
                <span className="text-muted-foreground">Rank #{worstContest.rank}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
