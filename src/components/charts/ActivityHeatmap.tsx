'use client';

import { useMemo, useState } from 'react';
import { DailyActivity } from '@/types';
import { generateHeatmapGrid, getHeatmapColorClass, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { format, getMonth } from 'date-fns';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface ActivityHeatmapProps {
  activities: DailyActivity[];
}

interface HeatmapTooltipProps {
  date: string;
  count: number;
  x: number;
  y: number;
}

export function ActivityHeatmap({ activities }: ActivityHeatmapProps) {
  const [tooltip, setTooltip] = useState<HeatmapTooltipProps | null>(null);

  // Build date → count map
  const activityMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const a of activities) {
      map[a.date.split('T')[0]] = a.problemsSolved;
    }
    return map;
  }, [activities]);

  const grid = useMemo(() => generateHeatmapGrid(activityMap, 53), [activityMap]);

  // Get month labels
  const monthLabels = useMemo(() => {
    const labels: { label: string; col: number }[] = [];
    let lastMonth = -1;
    grid.forEach((week, col) => {
      const month = getMonth(new Date(week[0].date));
      if (month !== lastMonth) {
        labels.push({ label: format(new Date(week[0].date), 'MMM'), col });
        lastMonth = month;
      }
    });
    return labels;
  }, [grid]);

  const totalSolved = useMemo(
    () => Object.values(activityMap).reduce((a, b) => a + b, 0),
    [activityMap]
  );

  const activeDays = useMemo(
    () => Object.values(activityMap).filter((v) => v > 0).length,
    [activityMap]
  );

  return (
    <div className="space-y-4">
      {/* Stats row */}
      <div className="flex items-center gap-6 text-sm">
        <span className="text-muted-foreground">
          <span className="font-semibold text-foreground">{totalSolved}</span> problems in the last year
        </span>
        <span className="text-muted-foreground">
          <span className="font-semibold text-foreground">{activeDays}</span> active days
        </span>
      </div>

      {/* Heatmap grid */}
      <div className="relative overflow-x-auto custom-scrollbar pb-2">
        <div className="inline-flex flex-col gap-1 min-w-max">
          {/* Month labels */}
          <div className="flex gap-1 pl-8">
            {monthLabels.map(({ label, col }) => (
              <div
                key={`${label}-${col}`}
                className="text-[10px] text-muted-foreground"
                style={{ marginLeft: col === 0 ? 0 : `${(col - (monthLabels[monthLabels.indexOf({ label, col })] ? monthLabels[monthLabels.indexOf({ label, col }) - 1]?.col ?? 0 : 0)) * 14}px` }}
              >
                {/* simplified: just render all month labels inline */}
              </div>
            ))}
          </div>

          {/* Day labels + grid */}
          <div className="flex gap-1">
            {/* Day labels */}
            <div className="flex flex-col gap-1 mr-1">
              {DAYS.map((day, i) => (
                <div key={day} className="h-3 w-6 text-[9px] text-muted-foreground flex items-center justify-end pr-1">
                  {i % 2 === 1 ? day.slice(0, 1) : ''}
                </div>
              ))}
            </div>

            {/* Weeks */}
            {grid.map((week, wIdx) => (
              <div key={wIdx} className="flex flex-col gap-1">
                {week.map((day, dIdx) => {
                  const isFuture = new Date(day.date) > new Date();
                  return (
                    <div
                      key={dIdx}
                      className={cn(
                        'heatmap-cell w-3 h-3',
                        isFuture ? 'opacity-0' : getHeatmapColorClass(day.count)
                      )}
                      onMouseEnter={(e) => {
                        if (!isFuture) {
                          setTooltip({
                            date: day.date,
                            count: day.count,
                            x: e.clientX,
                            y: e.clientY,
                          });
                        }
                      }}
                      onMouseLeave={() => setTooltip(null)}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <span>Less</span>
        {[0, 1, 2, 4, 7].map((count) => (
          <div key={count} className={cn('w-3 h-3 rounded-sm', getHeatmapColorClass(count))} />
        ))}
        <span>More</span>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 bg-popover border border-border rounded-lg shadow-xl px-3 py-2 text-xs pointer-events-none"
          style={{ top: tooltip.y - 60, left: tooltip.x - 80 }}
        >
          <p className="font-semibold">
            {tooltip.count === 0 ? 'No problems' : `${tooltip.count} problem${tooltip.count !== 1 ? 's' : ''}`}
          </p>
          <p className="text-muted-foreground">{formatDate(tooltip.date)}</p>
        </div>
      )}
    </div>
  );
}
