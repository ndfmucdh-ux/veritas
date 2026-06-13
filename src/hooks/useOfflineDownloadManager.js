import { useState, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { saveTranslationAsync, removeTranslationAsync } from '@/lib/offlineBible';

/**
 * Hook to manage downloading and storing Bible translations offline
 * Handles background downloads, progress tracking, and IndexedDB storage
 */
export function useOfflineDownloadManager() {
  const [downloads, setDownloads] = useState({});
  const [activeDownloads, setActiveDownloads] = useState(new Set());

  const startDownload = useCallback(async (translationCode, translationName) => {
    // Prevent duplicate downloads — read from state setter to avoid stale closure
    setActiveDownloads(prev => {
      if (prev.has(translationCode)) return prev; // already running, no-op
      return new Set([...prev, translationCode]);
    });

    // Check if already in-flight before proceeding (ref-based guard)
    // We use a local flag set before the async work begins
    let alreadyRunning = false;
    setActiveDownloads(prev => {
      alreadyRunning = prev.has(translationCode);
      return prev;
    });
    // Give setState a tick to flush
    await new Promise(r => setTimeout(r, 0));
    if (alreadyRunning) return;

    setDownloads(prev => ({
      ...prev,
      [translationCode]: { status: 'downloading', progress: 0, error: null },
    }));

    try {
      const response = await base44.functions.invoke('downloadBibleVersionOffline', {
        translation: translationCode,
      });

      const payload = response.data;
      if (payload?.data && payload.totalChapters > 0) {
        // saveTranslationAsync also updates _memCache now
        await saveTranslationAsync(translationCode, payload);

        setDownloads(prev => ({
          ...prev,
          [translationCode]: { status: 'completed', progress: 100, error: null },
        }));
      } else {
        throw new Error(payload?.error || 'Download returned no chapters');
      }
    } catch (error) {
      setDownloads(prev => ({
        ...prev,
        [translationCode]: { status: 'error', progress: 0, error: error.message },
      }));
    } finally {
      setActiveDownloads(prev => {
        const next = new Set(prev);
        next.delete(translationCode);
        return next;
      });
    }
  }, []);

  const cancelDownload = useCallback((translationCode) => {
    const updated = new Set(activeDownloads);
    updated.delete(translationCode);
    setActiveDownloads(updated);

    setDownloads(prev => ({
      ...prev,
      [translationCode]: {
        status: 'cancelled',
        progress: 0,
        error: 'Download cancelled',
      },
    }));
  }, [activeDownloads]);

  const removeTranslation = useCallback(async (translationCode) => {
    await removeTranslationAsync(translationCode);
    setDownloads(prev => {
      const updated = { ...prev };
      delete updated[translationCode];
      return updated;
    });
  }, []);

  const getDownloadStatus = useCallback((translationCode) => {
    return downloads[translationCode] || null;
  }, [downloads]);

  return {
    downloads,
    activeDownloads,
    startDownload,
    cancelDownload,
    removeTranslation,
    getDownloadStatus,
  };
}