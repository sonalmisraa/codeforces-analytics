'use client';

import { useState } from 'react';
import { Zap, Flame, Target, Clock, Plus } from 'lucide-react';
import { SectionCard } from '@/components/shared/SectionCard';
import { ActivityHeatmap } from '@/components/charts/ActivityHeatmap';
import { WeeklyBarChart } from '@/components/charts/WeeklyBarChart';
import { EmptyState } from '@/components/shared/EmptyState';
import { useApi, useMutation } from '@/hooks/useApi';
import { activityApi } from '@/services/api';
import { dashboardApi } from '@/services/api';

export default function HeatmapPage() {
  const [hoursInput, setHoursInput] = useState('');
  const [hoursMsg, setHoursMsg] = useState('');

  const { data: activity, loading: activityLoading } = useApi(
    () => activityApi.getDaily(365),
    []
  );
  const { data: weekly, loading: weeklyLoading, refetch: refetchWeekly } = useApi(
    () => activityApi.getWeeklyProgress(12),
    []
  );
  const { data: stats } = useApi(() => dashboardApi.getStats(), []);

  const { mutate: logHours, loading: logLoading } = useMutation((hours: number) =>
    activityApi.logHours(hours)
  );

  const handleLogHours = async () => {
    const h = parseFloat(hoursInput);
    if (isNaN(h) || h < 0 || h > 24) {
      setHoursMsg('Enter a valid number between 0 and 24');
      return;
    }
    try {
      await logHours(h);
      setHoursMsg('Hours logged!');
      setHoursInput('');
      refetchWeekly();
      setTimeout(() => setHoursMsg(''), 3000);
    } catch (e: any) {
      setHoursMsg(e.message || 'Failed to log hours');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Activity</h1>
        <p className="text-muted-foreground text-sm mt-1">Daily problem-solving streaks and weekly progress</p>
      </div>

      {/* Streak cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: 'Current Streak',
            value: stats?.currentStreak ?? 0,
            suffix: 'days',
            icon: Flame,
            color: 'text-red-500',
            bg: 'bg-red-500/10',
          },
          {
            label: 'Longest Streak',
            value: stats?.longestStreak ?? 0,
            suffix: 'days',
            icon: Zap,
            color: 'text-amber-500',
            bg: 'bg-amber-500/10',
          },
          {
            label: 'Total Solved',
            value: stats?.totalSolved ?? 0,
            suffix: 'problems',
            icon: Target,
            color: 'text-green-500',
            bg: 'bg-green-500/10',
          },
          {
            label: 'This Week',
            value: weekly?.reduce((s, w) => s + w.hoursCoded, 0)?.toFixed(1) ?? '0',
            suffix: 'hours coded',
            icon: Clock,
            color: 'text-brand-500',
            bg: 'bg-brand-500/10',
          },
        ].map((item) => (
          <div key={item.label} className="rounded-xl border border-border bg-card p-5">
            <div className={`w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center mb-3`}>
              <item.icon className={`w-4 h-4 ${item.color}`} />
            </div>
            <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Heatmap */}
      <SectionCard title="Activity Heatmap" subtitle="Problems solved per day (last 12 months)" icon={Zap}>
        {activityLoading ? (
          <div className="h-36 skeleton rounded-lg" />
        ) : !activity?.length ? (
          <EmptyState
            icon={Zap}
            title="No activity data"
            description="Sync your Codeforces handle to generate your heatmap."
            actionLabel="Go to Profile"
            actionHref="/dashboard/profile"
          />
        ) : (
          <ActivityHeatmap activities={activity} />
        )}
      </SectionCard>

      {/* Weekly chart */}
      <SectionCard
        title="Weekly Progress"
        subtitle="Problems solved and hours coded per week"
        icon={Target}
        action={
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-full bg-brand-500" />
              <span className="text-xs text-muted-foreground">Problems</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-full bg-violet-500" />
              <span className="text-xs text-muted-foreground">Hours</span>
            </div>
          </div>
        }
      >
        {weeklyLoading ? (
          <div className="h-52 skeleton rounded-lg" />
        ) : (
          <WeeklyBarChart data={weekly ?? []} />
        )}
      </SectionCard>

      {/* Manual hour logging */}
      <SectionCard
        title="Log Hours Coded"
        subtitle="Manually log your coding time for this week"
        icon={Clock}
      >
        <div className="flex items-start gap-3 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs text-muted-foreground mb-1.5 block">
              Hours coded today (0–24)
            </label>
            <input
              type="number"
              min="0"
              max="24"
              step="0.5"
              value={hoursInput}
              onChange={(e) => setHoursInput(e.target.value)}
              placeholder="e.g. 2.5"
              className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div className="flex flex-col justify-end">
            <button
              onClick={handleLogHours}
              disabled={logLoading || !hoursInput}
              className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              {logLoading ? 'Saving…' : 'Log hours'}
            </button>
          </div>
        </div>
        {hoursMsg && (
          <p className={`mt-2 text-sm ${hoursMsg.includes('!') ? 'text-green-500' : 'text-red-500'}`}>
            {hoursMsg}
          </p>
        )}
      </SectionCard>
    </div>
  );
}
