'use client';

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { format } from 'date-fns';
import { Contest } from '@/types';
import { getCFRatingHex, formatDate } from '@/lib/utils';
import { useTheme } from 'next-themes';

interface RatingGraphProps {
  contests: Contest[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;

  return (
    <div className="bg-popover border border-border rounded-xl shadow-xl p-3.5 min-w-[200px]">
      <p className="text-xs text-muted-foreground font-medium mb-2 truncate max-w-[200px]">
        {d.contestName}
      </p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        <span className="text-xs text-muted-foreground">Rating</span>
        <span className="text-xs font-bold" style={{ color: getCFRatingHex(d.newRating) }}>
          {d.newRating}
        </span>
        <span className="text-xs text-muted-foreground">Change</span>
        <span className={`text-xs font-semibold ${d.ratingChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          {d.ratingChange >= 0 ? '+' : ''}{d.ratingChange}
        </span>
        <span className="text-xs text-muted-foreground">Rank</span>
        <span className="text-xs font-medium">#{d.rank}</span>
        <span className="text-xs text-muted-foreground">Date</span>
        <span className="text-xs font-medium">{formatDate(d.contestDate)}</span>
      </div>
    </div>
  );
}

// CF rating tier reference lines
const CF_TIERS = [
  { rating: 1200, label: 'Pupil', color: '#008000' },
  { rating: 1400, label: 'Specialist', color: '#03A89E' },
  { rating: 1600, label: 'Expert', color: '#0000FF' },
  { rating: 1900, label: 'CM', color: '#AA00AA' },
  { rating: 2100, label: 'Master', color: '#FF8C00' },
  { rating: 2400, label: 'Grandmaster', color: '#FF3333' },
];

export function RatingGraph({ contests }: RatingGraphProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const chartData = [...contests]
    .sort((a, b) => new Date(a.contestDate).getTime() - new Date(b.contestDate).getTime())
    .map((c) => ({
      ...c,
      date: format(new Date(c.contestDate), 'MMM yy'),
      ratingChange: (c.newRating ?? 0) - (c.oldRating ?? 0),
    }));

  if (!chartData.length) {
    return (
      <div className="h-72 flex items-center justify-center text-muted-foreground text-sm">
        No contest data yet. Sync your Codeforces handle to get started.
      </div>
    );
  }

  const minRating = Math.min(...chartData.map((d) => d.newRating ?? 0)) - 100;
  const maxRating = Math.max(...chartData.map((d) => d.newRating ?? 0)) + 100;

  return (
    <ResponsiveContainer width="100%" height={320}>
      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="ratingGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
        </defs>

        <CartesianGrid
          strokeDasharray="3 3"
          stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}
        />

        {/* Tier reference lines */}
        {CF_TIERS.filter((t) => t.rating >= minRating && t.rating <= maxRating).map((tier) => (
          <ReferenceLine
            key={tier.rating}
            y={tier.rating}
            stroke={tier.color}
            strokeDasharray="4 4"
            strokeOpacity={0.5}
            label={{
              value: tier.label,
              position: 'insideTopRight',
              fontSize: 9,
              fill: tier.color,
              opacity: 0.7,
            }}
          />
        ))}

        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b' }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          domain={[minRating, maxRating]}
          tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b' }}
          axisLine={false}
          tickLine={false}
        />

        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '4 4' }} />

        <Area
          type="monotone"
          dataKey="newRating"
          stroke="#6366f1"
          strokeWidth={2.5}
          fill="url(#ratingGradient)"
          dot={chartData.length <= 30 ? {
            fill: '#6366f1',
            strokeWidth: 2,
            r: 4,
            stroke: isDark ? '#1e1b4b' : '#fff',
          } : false}
          activeDot={{ r: 6, fill: '#6366f1', stroke: isDark ? '#1e1b4b' : '#fff', strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
