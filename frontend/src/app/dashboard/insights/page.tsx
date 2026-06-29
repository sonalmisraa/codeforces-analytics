'use client';

import {
  Lightbulb, AlertTriangle, CheckCircle, Info,
  TrendingUp, ExternalLink, RefreshCw
} from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { insightsApi } from '@/services/api';
import { Insight } from '@/types';
import { cn } from '@/lib/utils';
import { EmptyState } from '@/components/shared/EmptyState';
import Link from 'next/link';

const INSIGHT_CONFIG = {
  warning: {
    icon: AlertTriangle,
    bg: 'bg-red-500/5',
    border: 'border-red-500/20',
    iconBg: 'bg-red-500/10',
    iconColor: 'text-red-500',
    badge: 'bg-red-500/10 text-red-500',
    badgeLabel: 'Warning',
  },
  success: {
    icon: CheckCircle,
    bg: 'bg-green-500/5',
    border: 'border-green-500/20',
    iconBg: 'bg-green-500/10',
    iconColor: 'text-green-500',
    badge: 'bg-green-500/10 text-green-500',
    badgeLabel: 'Great work',
  },
  suggestion: {
    icon: TrendingUp,
    bg: 'bg-brand-500/5',
    border: 'border-brand-500/20',
    iconBg: 'bg-brand-500/10',
    iconColor: 'text-brand-500',
    badge: 'bg-brand-500/10 text-brand-500',
    badgeLabel: 'Suggestion',
  },
  info: {
    icon: Info,
    bg: 'bg-cyan-500/5',
    border: 'border-cyan-500/20',
    iconBg: 'bg-cyan-500/10',
    iconColor: 'text-cyan-500',
    badge: 'bg-cyan-500/10 text-cyan-500',
    badgeLabel: 'Info',
  },
};

function InsightCard({ insight }: { insight: Insight }) {
  const config = INSIGHT_CONFIG[insight.type];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'rounded-xl border p-5 transition-all duration-200',
        config.bg,
        config.border,
        'hover:shadow-md'
      )}
    >
      <div className="flex items-start gap-4">
        <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5', config.iconBg)}>
          <Icon className={cn('w-4.5 h-4.5', config.iconColor)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h3 className="font-semibold text-sm">{insight.title}</h3>
            <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0', config.badge)}>
              {config.badgeLabel}
            </span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{insight.message}</p>
          {insight.actionLabel && (
            <div className="mt-3">
              {insight.actionUrl ? (
                <a
                  href={insight.actionUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={cn(
                    'inline-flex items-center gap-1.5 text-xs font-semibold transition-colors',
                    config.iconColor
                  )}
                >
                  {insight.actionLabel} <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <Link
                  href="/dashboard/topics"
                  className={cn('text-xs font-semibold transition-colors', config.iconColor)}
                >
                  {insight.actionLabel} →
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function InsightsPage() {
  const { data: insights, loading, refetch } = useApi(() => insightsApi.get(), []);

  const warnings = insights?.filter((i) => i.type === 'warning') ?? [];
  const successes = insights?.filter((i) => i.type === 'success') ?? [];
  const suggestions = insights?.filter((i) => i.type === 'suggestion') ?? [];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold">AI Insights</h1>
            <span className="text-xs bg-brand-500/10 text-brand-500 px-2 py-0.5 rounded-full font-semibold">
              Powered by analytics
            </span>
          </div>
          <p className="text-muted-foreground text-sm">
            Personalized recommendations based on your performance data
          </p>
        </div>
        <button
          onClick={refetch}
          disabled={loading}
          className="flex items-center gap-2 text-sm border border-border hover:border-brand-500/50 px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground transition-all"
        >
          <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 skeleton rounded-xl" />
          ))}
        </div>
      ) : !insights?.length ? (
        <EmptyState
          icon={Lightbulb}
          title="No insights yet"
          description="Sync your handles and build up some contest/problem history to get personalized insights."
          actionLabel="Sync Data"
          actionHref="/dashboard/profile"
        />
      ) : (
        <>
          {/* Summary strip */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Warnings', count: warnings.length, color: 'text-red-500', bg: 'bg-red-500/10' },
              { label: 'Suggestions', count: suggestions.length, color: 'text-brand-500', bg: 'bg-brand-500/10' },
              { label: 'Achievements', count: successes.length, color: 'text-green-500', bg: 'bg-green-500/10' },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-border bg-card p-4 text-center">
                <p className={`text-2xl font-bold ${s.color}`}>{s.count}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Warnings first */}
          {warnings.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                ⚠ Action Needed
              </h2>
              <div className="space-y-3">
                {warnings.map((insight) => (
                  <InsightCard key={insight.id} insight={insight} />
                ))}
              </div>
            </section>
          )}

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                💡 Recommendations
              </h2>
              <div className="space-y-3">
                {suggestions.map((insight) => (
                  <InsightCard key={insight.id} insight={insight} />
                ))}
              </div>
            </section>
          )}

          {/* Successes */}
          {successes.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                🎉 Milestones
              </h2>
              <div className="space-y-3">
                {successes.map((insight) => (
                  <InsightCard key={insight.id} insight={insight} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
