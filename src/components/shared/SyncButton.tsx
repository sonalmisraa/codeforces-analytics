'use client';

import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { syncApi } from '@/services/api';
import { useUserStore } from '@/store/userStore';

export function SyncButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const setIsSyncing = useUserStore((s) => s.setIsSyncing);
  const setLastSynced = useUserStore((s) => s.setLastSynced);

  const handleSync = async () => {
    setLoading(true);
    setIsSyncing(true);
    setMessage(null);
    try {
      await syncApi.sync();
      setLastSynced(new Date());
      setMessage('Synced!');
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage(err.message || 'Sync failed');
    } finally {
      setLoading(false);
      setIsSyncing(false);
    }
  };

  return (
    <button
      onClick={handleSync}
      disabled={loading}
      className={cn(
        'w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
        'border border-border hover:border-brand-500/50',
        'text-muted-foreground hover:text-foreground hover:bg-brand-500/5',
        loading && 'opacity-70 cursor-not-allowed'
      )}
    >
      <RefreshCw className={cn('w-4 h-4 shrink-0', loading && 'animate-spin')} />
      <span>{message ?? (loading ? 'Syncing…' : 'Sync Data')}</span>
    </button>
  );
}
