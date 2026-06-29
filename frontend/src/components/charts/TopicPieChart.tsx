'use client';

import {
  PieChart, Pie, Cell, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';
import { TopicStat } from '@/types';
import { formatTopic } from '@/lib/utils';

const TOPIC_COLORS = [
  '#6366f1', '#8b5cf6', '#06b6d4', '#10b981',
  '#f59e0b', '#ef4444', '#ec4899', '#14b8a6',
  '#f97316', '#84cc16', '#a855f7', '#3b82f6',
];

interface TopicPieChartProps {
  stats: TopicStat[];
}

function CustomLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) {
  if (percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-popover border border-border rounded-xl shadow-xl p-3">
      <p className="text-sm font-semibold mb-1">{d.name}</p>
      <p className="text-xs text-muted-foreground">{d.solved} solved ({d.percentage}%)</p>
      {d.attempted > d.solved && (
        <p className="text-xs text-muted-foreground">
          {Math.round((d.solved / d.attempted) * 100)}% success rate
        </p>
      )}
    </div>
  );
}

export function TopicPieChart({ stats }: TopicPieChartProps) {
  const totalSolved = stats.reduce((sum, s) => sum + s.solved, 0);

  const chartData = stats
    .filter((s) => s.solved > 0)
    .map((s, i) => ({
      name: formatTopic(s.topic),
      solved: s.solved,
      attempted: s.attempted,
      percentage: totalSolved > 0 ? Math.round((s.solved / totalSolved) * 100) : 0,
      fill: TOPIC_COLORS[i % TOPIC_COLORS.length],
    }))
    .sort((a, b) => b.solved - a.solved);

  if (!chartData.length) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">
        No topic data yet.
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row items-center gap-6">
      <ResponsiveContainer width={260} height={260}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={110}
            paddingAngle={2}
            dataKey="solved"
            labelLine={false}
            label={<CustomLabel />}
          >
            {chartData.map((entry, i) => (
              <Cell key={i} fill={entry.fill} stroke="transparent" />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend table */}
      <div className="flex-1 space-y-1.5 min-w-0">
        {chartData.map((item, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.fill }} />
            <span className="flex-1 truncate text-sm text-muted-foreground">{item.name}</span>
            <span className="font-semibold tabular-nums">{item.solved}</span>
            <span className="text-xs text-muted-foreground w-10 text-right">{item.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
