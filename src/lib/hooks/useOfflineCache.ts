'use client';

import { useEffect, useCallback, useState } from 'react';
import {
  saveAudioOffline,
  saveMarkersOffline,
  savePlaylistOffline,
  isAudioAvailableOffline,
  isOffline,
} from '~/lib/offlineStorage';

interface AudioData {
  id: string;
  name: string;
  description?: string | null;
  originalFileName: string;
  isPublic?: boolean;
  createdAt: Date | string;
}

interface MarkerData {
  id: string;
  audioId: string;
  label: string;
  timestamp: number;
  endTimestamp?: number | null;
  color?: string | null;
}

interface PlaylistData {
  id: string;
  name: string;
  description?: string | null;
  isPublic: boolean;
  createdAt: Date | string;
  audios: Array<{ audio: AudioData }>;
}

/**
 * Hook to cache audio data for offline access.
 * Automatically caches audio metadata, markers, and the audio file when listening.
 */
export function useOfflineAudioCache(
  audio: AudioData | null | undefined,
  markers: MarkerData[] | undefined
) {
  const [isAvailableOffline, setIsAvailableOffline] = useState(false);
  const [isCaching, setIsCaching] = useState(false);

  // Cache audio metadata and markers to IndexedDB
  useEffect(() => {
    async function cacheData() {
      if (!audio) return;

      try {
        // Save audio metadata
        await saveAudioOffline({
          id: audio.id,
          name: audio.name,
          description: audio.description,
          originalFileName: audio.originalFileName,
          isPublic: audio.isPublic ?? false,
          createdAt: typeof audio.createdAt === 'string' 
            ? audio.createdAt 
            : audio.createdAt.toISOString(),
        });

        // Save markers if available
        if (markers && markers.length > 0) {
          await saveMarkersOffline(markers);
        }

        // Check if fully available offline
        const available = await isAudioAvailableOffline(audio.id);
        setIsAvailableOffline(available);
      } catch (error) {
        console.error('[useOfflineAudioCache] Error caching data:', error);
      }
    }

    void cacheData();
  }, [audio, markers]);

  // Function to explicitly cache the audio file via service worker
  const cacheForOffline = useCallback(async () => {
    if (!audio || isCaching) return;

    setIsCaching(true);
    try {
      // Request the service worker to cache the page and audio
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        const pageUrl = `/audios/${audio.id}/listen`;
        const audioUrl = `/api/audio/${audio.id}/file`;

        navigator.serviceWorker.controller.postMessage({
          type: 'CACHE_FOR_OFFLINE',
          pageUrl: window.location.origin + pageUrl,
          audioUrl: window.location.origin + audioUrl,
        });

        // Wait a bit and check availability
        await new Promise(resolve => setTimeout(resolve, 1000));
        const available = await isAudioAvailableOffline(audio.id);
        setIsAvailableOffline(available);
      }
    } catch (error) {
      console.error('[useOfflineAudioCache] Error caching for offline:', error);
    } finally {
      setIsCaching(false);
    }
  }, [audio, isCaching]);

  return {
    isAvailableOffline,
    isCaching,
    cacheForOffline,
  };
}

/**
 * Hook to cache playlist data for offline access.
 * Automatically caches playlist metadata and all associated audio files.
 */
export function useOfflinePlaylistCache(playlist: PlaylistData | null | undefined) {
  const [isAvailableOffline, setIsAvailableOffline] = useState(false);
  const [isCaching, setIsCaching] = useState(false);
  const [cachingProgress, setCachingProgress] = useState({ current: 0, total: 0 });

  // Cache playlist metadata to IndexedDB
  useEffect(() => {
    async function cacheData() {
      if (!playlist) return;

      try {
        // Save playlist metadata
        await savePlaylistOffline({
          id: playlist.id,
          name: playlist.name,
          description: playlist.description,
          isPublic: playlist.isPublic,
          createdAt: typeof playlist.createdAt === 'string'
            ? playlist.createdAt
            : playlist.createdAt.toISOString(),
          audioIds: playlist.audios.map(a => a.audio.id),
        });

        // Save each audio's metadata
        for (const { audio } of playlist.audios) {
          await saveAudioOffline({
            id: audio.id,
            name: audio.name,
            description: audio.description,
            originalFileName: audio.originalFileName,
            isPublic: audio.isPublic ?? false,
            createdAt: typeof audio.createdAt === 'string'
              ? audio.createdAt
              : audio.createdAt.toISOString(),
          });
        }
      } catch (error) {
        console.error('[useOfflinePlaylistCache] Error caching data:', error);
      }
    }

    void cacheData();
  }, [playlist]);

  // Function to cache entire playlist (all audio files) for offline
  const cachePlaylistForOffline = useCallback(async () => {
    if (!playlist || isCaching) return;

    setIsCaching(true);
    const total = playlist.audios.length;
    setCachingProgress({ current: 0, total });

    try {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        // Cache the playlist listen page
        const playlistPageUrl = `/playlists/${playlist.id}/listen`;
        navigator.serviceWorker.controller.postMessage({
          type: 'CACHE_FOR_OFFLINE',
          pageUrl: window.location.origin + playlistPageUrl,
        });

        // Cache each audio file
        for (let i = 0; i < playlist.audios.length; i++) {
          const audio = playlist.audios[i]?.audio;
          if (!audio) continue;

          const audioPageUrl = `/audios/${audio.id}/listen`;
          const audioFileUrl = `/api/audio/${audio.id}/file`;

          navigator.serviceWorker.controller.postMessage({
            type: 'CACHE_FOR_OFFLINE',
            pageUrl: window.location.origin + audioPageUrl,
            audioUrl: window.location.origin + audioFileUrl,
          });

          setCachingProgress({ current: i + 1, total });
          
          // Small delay between requests to not overwhelm
          await new Promise(resolve => setTimeout(resolve, 500));
        }

        setIsAvailableOffline(true);
      }
    } catch (error) {
      console.error('[useOfflinePlaylistCache] Error caching for offline:', error);
    } finally {
      setIsCaching(false);
    }
  }, [playlist, isCaching]);

  return {
    isAvailableOffline,
    isCaching,
    cachingProgress,
    cachePlaylistForOffline,
  };
}

/**
 * Hook to get offline data when the network is unavailable.
 * Falls back to cached data from IndexedDB.
 */
export function useOfflineFallback<T>(
  onlineData: T | undefined,
  offlineDataFetcher: () => Promise<T | undefined>,
  deps: unknown[] = []
) {
  const [data, setData] = useState<T | undefined>(onlineData);
  const [isFromCache, setIsFromCache] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (onlineData) {
        setData(onlineData);
        setIsFromCache(false);
        return;
      }

      // Try to get from offline storage if online data is not available
      if (isOffline()) {
        try {
          const cachedData = await offlineDataFetcher();
          if (cachedData) {
            setData(cachedData);
            setIsFromCache(true);
          }
        } catch (error) {
          console.error('[useOfflineFallback] Error fetching offline data:', error);
        }
      }
    }

    void fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onlineData, ...deps]);

  return { data, isFromCache };
}

/**
 * Hook to check network status and provide offline indicators
 */
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline, isOffline: !isOnline };
}
