import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a Codeforces rank to a color class
 */
export function getCFRankColor(rank: string): string {
  const r = rank?.toLowerCase() ?? '';
  if (r.includes('legendary')) return 'text-cf-legendary font-bold';
  if (r.includes('international grandmaster')) return 'text-cf-legendary';
  if (r.includes('grandmaster')) return 'text-cf-red';
  if (r.includes('international master')) return 'text-cf-orange';
  if (r.includes('master')) return 'text-cf-orange';
  if (r.includes('candidate master')) return 'text-cf-violet';
  if (r.includes('expert')) return 'text-cf-blue';
  if (r.includes('specialist')) return 'text-cf-cyan';
  if (r.includes('pupil')) return 'text-cf-green';
  return 'text-cf-gray';
}

/**
 * Get Codeforces rating color (hex for charts)
 */
export function getCFRatingHex(rating: number): string {
  if (rating >= 3000) return '#FF0000';
  if (rating >= 2600) return '#FF0000';
  if (rating >= 2400) return '#FF3333';
  if (rating >= 2300) return '#FF8C00';
  if (rating >= 2100) return '#FF8C00';
  if (rating >= 1900) return '#AA00AA';
  if (rating >= 1600) return '#0000FF';
  if (rating >= 1400) return '#03A89E';
  if (rating >= 1200) return '#008000';
  return '#808080';
}

/**
 * Format topic name from enum to readable string
 */
export function formatTopic(topic: string): string {
  return topic
    .split('_')
    .map((w) => w[0] + w.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Format date for display
 */
export function formatDate(date: string | Date): string {
  return format(new Date(date), 'MMM d, yyyy');
}

/**
 * Format relative time
 */
export function formatRelativeTime(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

/**
 * Format rating change with sign
 */
export function formatRatingChange(change: number): string {
  if (change > 0) return `+${change}`;
  return `${change}`;
}

/**
 * Get heatmap color based on solve count
 */
export function getHeatmapColor(count: number, isDark: boolean): string {
  if (count === 0) return isDark ? '#1e293b' : '#f1f5f9';
  if (count === 1) return '#bbf7d0';
  if (count <= 3) return '#4ade80';
  if (count <= 6) return '#16a34a';
  return '#15803d';
}

/**
 * Get heatmap color class
 */
export function getHeatmapColorClass(count: number): string {
  if (count === 0) return 'bg-muted';
  if (count === 1) return 'bg-green-200 dark:bg-green-900';
  if (count <= 3) return 'bg-green-400 dark:bg-green-700';
  if (count <= 6) return 'bg-green-500 dark:bg-green-600';
  return 'bg-green-600 dark:bg-green-500';
}

/**
 * Truncate long strings
 */
export function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max) + '…' : str;
}

/**
 * Generate last N months of weeks for heatmap
 */
export function generateHeatmapGrid(
  activityMap: Record<string, number>,
  weeks: number = 53
): Array<Array<{ date: string; count: number }>> {
  const grid: Array<Array<{ date: string; count: number }>> = [];
  const today = new Date();

  // Find the start Sunday
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - weeks * 7 + 1);
  // Align to Sunday
  const dayOfWeek = startDate.getDay();
  startDate.setDate(startDate.getDate() - dayOfWeek);

  let current = new Date(startDate);
  for (let week = 0; week < weeks; week++) {
    const weekData: Array<{ date: string; count: number }> = [];
    for (let day = 0; day < 7; day++) {
      const dateStr = current.toISOString().split('T')[0];
      weekData.push({
        date: dateStr,
        count: activityMap[dateStr] ?? 0,
      });
      current.setDate(current.getDate() + 1);
    }
    grid.push(weekData);
  }

  return grid;
}
