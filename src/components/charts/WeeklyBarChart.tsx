'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';
import { WeeklyProgress } from '@/types';
import { format } from 'date-fns';
import { useTheme } from 'next-themes';

interface WeeklyChartProps {
  data: WeeklyProgress[];
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border border-border rounded-xl shadow-xl p-3 text-xs">
      <p className="font-semibold mb-1.5 text-foreground">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.fill }} />
          <span className="text-muted-foreground capitalize">{p.dataKey === 'problemsSolved' ? 'Problems' : 'Hours'}:</span>
          <span className="font-semibold">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

export function WeeklyBarChart({ data }: WeeklyChartProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const chartData = data.map((w) => ({
    week: format(new Date(w.weekStart), 'MMM d'),
    problemsSolved: w.problemsSolved,
    hoursCoded: w.hoursCoded,
  }));

  if (!chartData.length) {
    return (
      <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
        No weekly data yet.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} vertical={false} />
        <XAxis
          dataKey="week"
          tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.05)' }} />
        <Bar dataKey="problemsSolved" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={32} />
        <Bar dataKey="hoursCoded" fill="#8b5cf6" radius={[4, 4, 0, 0]} maxBarSize={32} />
      </BarChart>
    </ResponsiveContainer>
  );
}
