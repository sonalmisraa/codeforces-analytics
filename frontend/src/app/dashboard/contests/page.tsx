'use client';

import { useState, useCallback } from 'react';
import { Trophy, Search, ChevronUp, ChevronDown, Download } from 'lucide-react';
import { SectionCard } from '@/components/shared/SectionCard';
import { TableSkeleton } from '@/components/shared/Skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { useApi } from '@/hooks/useApi';
import { contestApi } from '@/services/api';
import { formatDate, formatRatingChange, cn } from '@/lib/utils';
import { Contest } from '@/types';

type SortKey = 'contestDate' | 'rank' | 'ratingChange' | 'newRating';
type SortDir = 'asc' | 'desc';

function RatingBadge({ change }: { change: number | undefined }) {
  if (change === undefined || change === null) return <span className="text-muted-foreground">—</span>;
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold',
        change > 0 ? 'bg-green-500/10 text-green-500' : change < 0 ? 'bg-red-500/10 text-red-500' : 'bg-muted text-muted-foreground'
      )}
    >
      {formatRatingChange(change)}
    </span>
  );
}

export default function ContestsPage() {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('contestDate');
  const [sortOrder, setSortOrder] = useState<SortDir>('desc');
  const [page, setPage] = useState(1);
  const LIMIT = 15;

  const { data: contests, loading, pagination } = useApi(
    () => contestApi.getHistory({ page, limit: LIMIT, search, sortBy, sortOrder }),
    [page, search, sortBy, sortOrder]
  ) as any;

  const handleSort = (key: SortKey) => {
    if (sortBy === key) {
      setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(key);
      setSortOrder('desc');
    }
    setPage(1);
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortBy !== col) return <ChevronDown className="w-3.5 h-3.5 opacity-30" />;
    return sortOrder === 'asc'
      ? <ChevronUp className="w-3.5 h-3.5 text-brand-500" />
      : <ChevronDown className="w-3.5 h-3.5 text-brand-500" />;
  };

  // CSV export
  const handleExport = () => {
    if (!contests?.length) return;
    const header = 'Contest Name,Date,Rank,Old Rating,New Rating,Change\n';
    const rows = (contests as Contest[])
      .map((c) => `"${c.contestName}",${formatDate(c.contestDate)},${c.rank},${c.oldRating},${c.newRating},${c.ratingChange}`)
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'contest-history.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalPages = pagination?.totalPages ?? 1;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Contest History</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {pagination?.total ? `${pagination.total} contests` : 'All your Codeforces contests'}
          </p>
        </div>
        <button
          onClick={handleExport}
          disabled={!contests?.length}
          className="flex items-center gap-2 text-sm border border-border hover:border-brand-500/50 px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground transition-all disabled:opacity-40"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <SectionCard
        title="All Contests"
        subtitle="Sorted by date by default"
        icon={Trophy}
        noPadding
        action={
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search contests…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-8 pr-3 py-1.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500 w-52"
            />
          </div>
        }
      >
        {loading ? (
          <TableSkeleton rows={LIMIT} />
        ) : !contests?.length ? (
          <EmptyState
            icon={Trophy}
            title="No contests found"
            description={search ? `No contests match "${search}". Try a different search.` : 'Sync your Codeforces handle to load contest history.'}
            actionLabel="Go to Profile"
            actionHref="/dashboard/profile"
          />
        ) : (
          <>
            {/* Table */}
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    {[
                      { label: 'Contest', key: null },
                      { label: 'Date', key: 'contestDate' as SortKey },
                      { label: 'Rank', key: 'rank' as SortKey },
                      { label: 'Old Rating', key: null },
                      { label: 'New Rating', key: 'newRating' as SortKey },
                      { label: 'Change', key: 'ratingChange' as SortKey },
                    ].map(({ label, key }) => (
                      <th
                        key={label}
                        className={cn(
                          'text-left px-4 py-3 text-xs font-medium text-muted-foreground',
                          key && 'cursor-pointer hover:text-foreground select-none'
                        )}
                        onClick={() => key && handleSort(key)}
                      >
                        <div className="flex items-center gap-1">
                          {label}
                          {key && <SortIcon col={key} />}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {(contests as Contest[]).map((c) => (
                    <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium max-w-xs">
                        <a
                          href={`https://codeforces.com/contest/${c.contestId}`}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:text-brand-500 transition-colors line-clamp-1"
                        >
                          {c.contestName}
                        </a>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {formatDate(c.contestDate)}
                      </td>
                      <td className="px-4 py-3 font-mono">#{c.rank}</td>
                      <td className="px-4 py-3 text-muted-foreground">{c.oldRating}</td>
                      <td className="px-4 py-3 font-semibold">{c.newRating}</td>
                      <td className="px-4 py-3">
                        <RatingBadge change={c.ratingChange} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Page {page} of {totalPages} · {pagination?.total} total
                </p>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 text-xs rounded-lg border border-border hover:border-brand-500/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    Previous
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                    return (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={cn(
                          'w-8 h-8 text-xs rounded-lg border transition-all',
                          p === page
                            ? 'border-brand-500 bg-brand-500 text-white'
                            : 'border-border hover:border-brand-500/50'
                        )}
                      >
                        {p}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1.5 text-xs rounded-lg border border-border hover:border-brand-500/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
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
