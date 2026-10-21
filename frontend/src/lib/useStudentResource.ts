'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export interface StudentResource<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  /** Re-fetch from the API (used by retry buttons). */
  reload: () => void;
  /** Update the cached value in place after a successful mutation. */
  mutate: (updater: (previous: T | null) => T | null) => void;
}

interface ResourceState<T> {
  key: string;
  data: T | null;
  loading: boolean;
  error: string | null;
}

/**
 * Small data-fetching hook for the Student Portal screens.
 *
 * `key` identifies the requested resource (e.g. `email:brand`). When the key
 * changes the resource is re-fetched; stale state is never shown because the
 * value is derived against the current key.
 */
export function useStudentResource<T>(
  key: string,
  fetcher: () => Promise<T>,
): StudentResource<T> {
  const [result, setResult] = useState<ResourceState<T>>({
    key,
    data: null,
    loading: true,
    error: null,
  });

  // Always call the latest fetcher without re-running the effect on each render.
  // The ref is synced in an effect (never during render) and declared before the
  // fetch effect so it is up to date by the time a fetch starts.
  const fetcherRef = useRef(fetcher);

  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  useEffect(() => {
    let cancelled = false;
    fetcherRef.current().then(
      (data) => {
        if (!cancelled) setResult({ key, data, loading: false, error: null });
      },
      (error: unknown) => {
        if (!cancelled) {
          setResult({
            key,
            data: null,
            loading: false,
            error: error instanceof Error ? error.message : 'Something went wrong',
          });
        }
      },
    );
    return () => {
      cancelled = true;
    };
  }, [key]);

  const current: ResourceState<T> =
    result.key === key ? result : { key, data: null, loading: true, error: null };

  const reload = useCallback(() => {
    setResult((previous) => ({ ...previous, loading: true, error: null }));
    fetcherRef.current().then(
      (data) => setResult({ key, data, loading: false, error: null }),
      (error: unknown) =>
        setResult({
          key,
          data: null,
          loading: false,
          error: error instanceof Error ? error.message : 'Something went wrong',
        }),
    );
  }, [key]);

  const mutate = useCallback(
    (updater: (previous: T | null) => T | null) => {
      setResult((previous) => {
        if (previous.key !== key) return previous;
        return { ...previous, data: updater(previous.data) };
      });
    },
    [key],
  );

  return { data: current.data, loading: current.loading, error: current.error, reload, mutate };
}
