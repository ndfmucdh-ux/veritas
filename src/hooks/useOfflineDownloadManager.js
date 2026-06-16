import { useState, useCallback, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { saveTranslationAsync, removeTranslationAsync } from '@/lib/offlineBible';

/**
 * Hook to manage downloading and storing Bible translations offline
 * Handles background downloads, progress tracking, and IndexedDB storage
 */
export function useOfflineDownloadManager() {
  const [downloads, setDownloads] = useState({});
  const [activeDownloads, setActiveDownloads] = useState(new Set());
  // Synchronous in-flight guard. State updates are async/batched, so reading
  // `activeDownloads` to detect duplicates races with itself. A ref is updated
  // synchronously and is the single source of truth for "is this running now".
  const inFlightRef = useRef(new Set());

  const startDownload = useCallback(async (translationCode, translationName) => {
    // Synchronous duplicate guard — bail before any async work if already running.
    if (inFlightRef.current.has(translationCode)) return;
    inFlightRef.current.add(translationCode);
    setActiveDownloads(prev => new Set([...prev, translationCode]));

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
      inFlightRef.current.delete(translationCode);
      setActiveDownloads(prev => {
        const next = new Set(prev);
        next.delete(translationCode);
        return next;
      });
    }
  }, []);

  const cancelDownload = useCallback((translationCode) => {
    inFlightRef.current.delete(translationCode);
    // Functional updater avoids the stale-closure bug when cancels overlap.
    setActiveDownloads(prev => {
      const next = new Set(prev);
      next.delete(translationCode);
      return next;
    });

    setDownloads(prev => ({
      ...prev,
      [translationCode]: {
        status: 'cancelled',
        progress: 0,
        error: 'Download cancelled',
      },
    }));
  }, []);

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