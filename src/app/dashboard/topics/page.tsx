'use client';

import { Code2 } from 'lucide-react';
import { SectionCard } from '@/components/shared/SectionCard';
import { TopicPieChart } from '@/components/charts/TopicPieChart';
import { EmptyState } from '@/components/shared/EmptyState';
import { useApi } from '@/hooks/useApi';
import { activityApi } from '@/services/api';
import { formatTopic, cn } from '@/lib/utils';
import { TopicStat } from '@/types';

const TOPIC_COLORS = [
  '#6366f1','#8b5cf6','#06b6d4','#10b981',
  '#f59e0b','#ef4444','#ec4899','#14b8a6',
  '#f97316','#84cc16','#a855f7','#3b82f6',
];

function TopicRow({ stat, index, total }: { stat: TopicStat; index: number; total: number }) {
  const pct = total > 0 ? Math.round((stat.solved / total) * 100) : 0;
  const successRate = stat.attempted > 0 ? Math.round((stat.solved / stat.attempted) * 100) : 0;
  const color = TOPIC_COLORS[index % TOPIC_COLORS.length];

  return (
    <div className="p-4 rounded-xl border border-border bg-card hover:border-brand-500/30 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full mt-0.5" style={{ backgroundColor: color }} />
          <span className="font-medium text-sm">{formatTopic(stat.topic)}</span>
        </div>
        <span className="text-xs text-muted-foreground">{pct}% of total</span>
      </div>

      <div className="flex items-end gap-4 mb-3">
        <div>
          <p className="text-2xl font-bold">{stat.solved}</p>
          <p className="text-xs text-muted-foreground">solved</p>
        </div>
        {stat.attempted > stat.solved && (
          <div>
            <p className="text-lg font-semibold text-muted-foreground">{stat.attempted}</p>
            <p className="text-xs text-muted-foreground">attempted</p>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full bg-muted overflow-hidden mb-2">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${successRate}%`, backgroundColor: color }}
        />
      </div>
      <p className="text-xs text-muted-foreground">{successRate}% success rate</p>
    </div>
  );
}

export default function TopicsPage() {
  const { data: stats, loading } = useApi(() => activityApi.getTopics(), []);
  const topicStats = stats ?? [];
  const total = topicStats.reduce((s, t) => s + t.solved, 0);

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Topic Analytics</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Problem-solving breakdown by topic across Codeforces
        </p>
      </div>

      {/* Pie chart section */}
      <SectionCard title="Topic Distribution" subtitle="Solved problems by category" icon={Code2}>
        {loading ? (
          <div className="h-64 skeleton rounded-lg" />
        ) : topicStats.length === 0 ? (
          <EmptyState
            icon={Code2}
            title="No topic data"
            description="Sync your Codeforces handle to analyze your topic distribution."
            actionLabel="Go to Profile"
            actionHref="/dashboard/profile"
          />
        ) : (
          <TopicPieChart stats={topicStats} />
        )}
      </SectionCard>

      {/* Topic grid */}
      {!loading && topicStats.length > 0 && (
        <>
          <div>
            <h2 className="font-semibold mb-4">All Topics</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...topicStats]
                .sort((a, b) => b.solved - a.solved)
                .map((stat, i) => (
                  <TopicRow key={stat.id} stat={stat} index={i} total={total} />
                ))}
            </div>
          </div>

          {/* Weak topics highlight */}
          {topicStats.some((s) => s.attempted >= 5 && s.solved / s.attempted < 0.5) && (
            <SectionCard
              title="Needs Attention"
              subtitle="Topics with < 50% success rate (5+ attempts)"
              icon={Code2}
            >
              <div className="space-y-3">
                {topicStats
                  .filter((s) => s.attempted >= 5 && s.solved / s.attempted < 0.5)
                  .sort((a, b) => a.solved / a.attempted - b.solved / b.attempted)
                  .map((s) => {
                    const rate = Math.round((s.solved / s.attempted) * 100);
                    return (
                      <div key={s.id} className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium">{formatTopic(s.topic)}</span>
                            <span className={cn('text-xs font-semibold', rate < 30 ? 'text-red-500' : 'text-yellow-500')}>
                              {rate}%
                            </span>
                          </div>
                          <div className="h-2 rounded-full bg-muted overflow-hidden">
                            <div
                              className={cn('h-full rounded-full', rate < 30 ? 'bg-red-500' : 'bg-yellow-500')}
                              style={{ width: `${rate}%` }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {s.solved}/{s.attempted} solved
                          </p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </SectionCard>
          )}
        </>
      )}
    </div>
  );
}
