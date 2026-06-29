'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { AxiosResponse } from 'axios';
import { ApiResponse } from '@/types';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Generic hook for API data fetching with loading/error state
 */
export function useApi<T>(
  fetchFn: () => Promise<AxiosResponse<ApiResponse<T>>>,
  deps: unknown[] = []
): UseApiState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchFn();
      if (mountedRef.current) {
        setData(res.data.data ?? null);
      }
    } catch (err: any) {
      if (mountedRef.current) {
        setError(err.message || 'An error occurred');
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    mountedRef.current = true;
    fetch();
    return () => {
      mountedRef.current = false;
    };
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

/**
 * Hook for mutations (POST/PUT/DELETE)
 */
export function useMutation<TData, TResponse = unknown>(
  mutateFn: (data: TData) => Promise<AxiosResponse<ApiResponse<TResponse>>>
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<TResponse | null>(null);

  const mutate = useCallback(
    async (payload: TData) => {
      setLoading(true);
      setError(null);
      try {
        const res = await mutateFn(payload);
        setData(res.data.data ?? null);
        return res.data;
      } catch (err: any) {
        const message = err.message || 'An error occurred';
        setError(message);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    [mutateFn]
  );

  return { mutate, loading, error, data };
}
