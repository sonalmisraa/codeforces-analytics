'use client';

import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAnimatedCounter } from '@/hooks/useAnimatedCounter';

interface StatCardProps {
  title: string;
  value: number | string | null | undefined;
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  trend?: { value: number; label: string };
  badge?: string;
  badgeColor?: string;
  className?: string;
  animate?: boolean;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = 'text-brand-500',
  iconBg = 'bg-brand-500/10',
  trend,
  badge,
  badgeColor = 'bg-brand-500/10 text-brand-500',
  className,
  animate = true,
}: StatCardProps) {
  const numericValue = typeof value === 'number' ? value : 0;
  const animatedValue = useAnimatedCounter(numericValue, 900, animate && typeof value === 'number');

  const displayValue = typeof value === 'number' ? animatedValue : (value ?? '—');

  return (
    <div
      className={cn(
        'group relative rounded-xl border border-border bg-card p-6',
        'hover:border-brand-500/30 hover:shadow-lg hover:shadow-brand-500/5',
        'transition-all duration-300',
        className
      )}
    >
      {/* Subtle glow on hover */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-brand-500/0 to-brand-500/0 group-hover:from-brand-500/3 group-hover:to-transparent transition-all duration-300 pointer-events-none" />

      <div className="flex items-start justify-between mb-4">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center', iconBg)}>
          <Icon className={cn('w-4.5 h-4.5', iconColor)} />
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-3xl font-bold tracking-tight stat-value">
          {displayValue}
        </p>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>

      {(trend || badge) && (
        <div className="mt-4 flex items-center gap-2">
          {trend && (
            <span
              className={cn(
                'text-xs font-medium px-2 py-0.5 rounded-full',
                trend.value >= 0
                  ? 'bg-green-500/10 text-green-500'
                  : 'bg-red-500/10 text-red-500'
              )}
            >
              {trend.value >= 0 ? '+' : ''}{trend.value} {trend.label}
            </span>
          )}
          {badge && (
            <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', badgeColor)}>
              {badge}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
