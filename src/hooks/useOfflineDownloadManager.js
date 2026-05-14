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
    // Prevent duplicate downloads
    if (activeDownloads.has(translationCode)) return;

    const newActive = new Set(activeDownloads);
    newActive.add(translationCode);
    setActiveDownloads(newActive);

    setDownloads(prev => ({
      ...prev,
      [translationCode]: {
        status: 'downloading',
        progress: 0,
        error: null,
      },
    }));

    try {
      // Call backend function to fetch all Bible data
      const response = await base44.functions.invoke('downloadBibleVersionOffline', {
        translation: translationCode,
      });

      if (response.data?.success) {
        // Save to IndexedDB for offline access
        await saveTranslationAsync(translationCode, {
          name: translationName,
          code: translationCode,
          lang: translationCode.match(/^(RVR|NVI|LBLA|BTX|TLA|DHH|NTV)/i) ? 'es' : 'en',
          data: response.data.data,
          totalChapters: response.data.chapters_downloaded,
        });

        setDownloads(prev => ({
          ...prev,
          [translationCode]: {
            status: 'completed',
            progress: 100,
            error: null,
          },
        }));
      }
    } catch (error) {
      setDownloads(prev => ({
        ...prev,
        [translationCode]: {
          status: 'error',
          progress: 0,
          error: error.message,
        },
      }));
    } finally {
      const updated = new Set(activeDownloads);
      updated.delete(translationCode);
      setActiveDownloads(updated);
    }
  }, [activeDownloads]);

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