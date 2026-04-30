'use client';

import { useState, useEffect, useCallback } from 'react';
import { RegistryEntry } from '@/lib/types';

/**
 * useRegistry Hook
 * Manages interaction with the server-side agent registry (Vercel KV).
 */
export function useRegistry() {
  const [entries, setEntries] = useState<RegistryEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRegistry = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/registry');
      if (!response.ok) throw new Error('Failed to fetch registry');
      const data = await response.json();
      setEntries(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('useRegistry Fetch Error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const publishAgent = useCallback(async (entry: RegistryEntry) => {
    setError(null);
    try {
      const response = await fetch('/api/registry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to publish agent');
      }
      const savedEntry = await response.json();
      
      // Update local state
      setEntries(prev => {
        const index = prev.findIndex(e => e.did === savedEntry.did);
        if (index !== -1) {
          const next = [...prev];
          next[index] = savedEntry;
          return next;
        }
        return [...prev, savedEntry];
      });
      
      return savedEntry;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  }, []);

  const removeAgent = useCallback(async (id: string) => {
    setError(null);
    try {
      const response = await fetch(`/api/registry?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to remove agent');
      
      // Update local state
      setEntries(prev => prev.filter(e => e.did !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  }, []);

  const refresh = useCallback(() => {
    fetchRegistry();
  }, [fetchRegistry]);

  useEffect(() => {
    fetchRegistry();
  }, [fetchRegistry]);

  return {
    entries,
    loading,
    error,
    publishAgent,
    removeAgent,
    refresh
  };
}
