'use client';

import { useState } from 'react';
import { ListOrdered, Search, Trophy, Flame, Code2, TrendingUp } from 'lucide-react';
import { SectionCard } from '@/components/shared/SectionCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { useApi } from '@/hooks/useApi';
import { leaderboardApi } from '@/services/api';
import { LeaderboardUser } from '@/types';
import { cn } from '@/lib/utils';

const RANK_COLORS: Record<number, string> = {
  1: 'text-yellow-500',
  2: 'text-gray-400',
  3: 'text-amber-600',
};

function getRankBadge(rank: number) {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return `#${rank}`;
}

function getCFRankColor(rank?: string) {
  if (!rank) return 'text-muted-foreground';
  const r = rank.toLowerCase();
  if (r.includes('legendary') || r.includes('international grandmaster')) return 'text-red-500 font-bold';
  if (r.includes('grandmaster')) return 'text-red-400';
  if (r.includes('master')) return 'text-orange-500';
  if (r.includes('candidate')) return 'text-violet-500';
  if (r.includes('expert')) return 'text-blue-500';
  if (r.includes('specialist')) return 'text-cyan-500';
  if (r.includes('pupil')) return 'text-green-500';
  return 'text-muted-foreground';
}

export default function LeaderboardPage() {
  const [search, setSearch] = useState('');
  const [college, setCollege] = useState('');
  const [page, setPage] = useState(1);
  const LIMIT = 20;

  const { data: users, loading, pagination } = useApi(
    () => leaderboardApi.get({ page, limit: LIMIT, college: college || undefined }),
    [page, college]
  ) as any;

  const filtered = search
    ? (users as LeaderboardUser[])?.filter(
        (u) =>
          u.name?.toLowerCase().includes(search.toLowerCase()) ||
          u.codeforcesHandle?.toLowerCase().includes(search.toLowerCase()) ||
          u.college?.toLowerCase().includes(search.toLowerCase())
      )
    : users;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Leaderboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Ranked by Codeforces rating · {pagination?.total ?? 0} users
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name or handle…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500 w-56"
          />
        </div>
        <input
          type="text"
          placeholder="Filter by college…"
          value={college}
          onChange={(e) => { setCollege(e.target.value); setPage(1); }}
          className="px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500 w-48"
        />
      </div>

      {/* Top 3 podium */}
      {!loading && filtered?.length >= 3 && page === 1 && !search && (
        <div className="grid grid-cols-3 gap-3">
          {[1, 0, 2].map((idx) => {
            const u = (filtered as LeaderboardUser[])[idx];
            const rank = idx + 1;
            const display = idx === 0 ? 1 : idx === 1 ? 0 + 1 : 2 + 1;
            return (
              <div
                key={u.id}
                className={cn(
                  'rounded-xl border bg-card p-4 text-center transition-all',
                  idx === 0
                    ? 'border-yellow-500/30 bg-yellow-500/5 shadow-lg shadow-yellow-500/10'
                    : 'border-border'
                )}
              >
                <div className="text-2xl mb-2">{getRankBadge(rank)}</div>
                <img
                  src={u.avatar ?? `https://api.dicebear.com/7.x/initials/svg?seed=${u.name}`}
                  alt={u.name ?? 'User'}
                  className="w-10 h-10 rounded-full mx-auto mb-2 border-2 border-border"
                />
                <p className="font-semibold text-sm truncate">{u.name ?? u.codeforcesHandle}</p>
                <p className="text-xs text-muted-foreground truncate">{u.college}</p>
                <p className={cn('text-lg font-bold mt-1', RANK_COLORS[rank] ?? 'text-foreground')}>
                  {u.codeforcesRating ?? '—'}
                </p>
                <p className={cn('text-xs', getCFRankColor(u.codeforcesRank))}>
                  {u.codeforcesRank ?? 'Unrated'}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Full table */}
      <SectionCard title="All Users" subtitle="Sorted by rating" icon={ListOrdered} noPadding>
        {loading ? (
          <div className="divide-y divide-border">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3">
                <div className="skeleton h-4 w-6 rounded" />
                <div className="skeleton h-8 w-8 rounded-full" />
                <div className="skeleton h-4 flex-1 rounded" />
                <div className="skeleton h-4 w-16 rounded" />
                <div className="skeleton h-4 w-16 rounded" />
              </div>
            ))}
          </div>
        ) : !filtered?.length ? (
          <EmptyState
            icon={ListOrdered}
            title="No users found"
            description="No users match your search. Try different filters."
          />
        ) : (
          <>
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground w-12">Rank</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">User</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground hidden md:table-cell">College</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground">
                      <div className="flex items-center justify-end gap-1"><TrendingUp className="w-3 h-3" /> Rating</div>
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground hidden sm:table-cell">
                      <div className="flex items-center justify-end gap-1"><Code2 className="w-3 h-3" /> Solved</div>
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground hidden sm:table-cell">
                      <div className="flex items-center justify-end gap-1"><Flame className="w-3 h-3" /> Streak</div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {(filtered as LeaderboardUser[]).map((u, i) => {
                    const rank = (page - 1) * LIMIT + i + 1;
                    return (
                      <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">
                          <span className={cn('font-bold text-sm', RANK_COLORS[rank] ?? 'text-muted-foreground')}>
                            {getRankBadge(rank)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={u.avatar ?? `https://api.dicebear.com/7.x/initials/svg?seed=${u.name ?? u.codeforcesHandle}`}
                              alt={u.name ?? 'User'}
                              className="w-8 h-8 rounded-full border border-border shrink-0"
                            />
                            <div>
                              <p className="font-medium text-sm">{u.name ?? 'Anonymous'}</p>
                              {u.codeforcesHandle && (
                                <a
                                  href={`https://codeforces.com/profile/${u.codeforcesHandle}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-xs text-brand-500 hover:underline"
                                >
                                  @{u.codeforcesHandle}
                                </a>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground hidden md:table-cell">
                          {u.college ?? '—'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div>
                            <span className="font-bold">{u.codeforcesRating ?? '—'}</span>
                            {u.codeforcesRank && (
                              <p className={cn('text-xs', getCFRankColor(u.codeforcesRank))}>
                                {u.codeforcesRank}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right text-sm hidden sm:table-cell">
                          {u.totalSolved}
                        </td>
                        <td className="px-4 py-3 text-right text-sm hidden sm:table-cell">
                          {u.currentStreak > 0 ? (
                            <span className="text-red-500 font-semibold">🔥 {u.currentStreak}</span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {(pagination?.totalPages ?? 1) > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Page {page} of {pagination?.totalPages}
                </p>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 text-xs rounded-lg border border-border hover:border-brand-500/50 disabled:opacity-40 transition-all"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(pagination?.totalPages ?? 1, p + 1))}
                    disabled={page >= (pagination?.totalPages ?? 1)}
                    className="px-3 py-1.5 text-xs rounded-lg border border-border hover:border-brand-500/50 disabled:opacity-40 transition-all"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </SectionCard>
    </div>
  );
}
