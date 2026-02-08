/**
 * IndexedDB-based offline storage for audio metadata, markers, and playlists.
 * Enables full offline access to previously listened content.
 */

const DB_NAME = 'audio-marker-offline';
const DB_VERSION = 1;

interface AudioMetadata {
  id: string;
  name: string;
  description?: string | null;
  originalFileName: string;
  isPublic: boolean;
  createdAt: string;
  cachedAt: number;
}

interface Marker {
  id: string;
  audioId: string;
  label: string;
  timestamp: number;
  endTimestamp?: number | null;
  color?: string | null;
}

interface PlaylistMetadata {
  id: string;
  name: string;
  description?: string | null;
  isPublic: boolean;
  createdAt: string;
  audioIds: string[];
  cachedAt: number;
}

type StoreName = 'audios' | 'markers' | 'playlists';

/**
 * Open the IndexedDB database
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('[OfflineStorage] Failed to open database:', request.error);
      reject(new Error(request.error?.message ?? 'Failed to open database'));
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create audios store
      if (!db.objectStoreNames.contains('audios')) {
        const audioStore = db.createObjectStore('audios', { keyPath: 'id' });
        audioStore.createIndex('cachedAt', 'cachedAt', { unique: false });
      }

      // Create markers store
      if (!db.objectStoreNames.contains('markers')) {
        const markerStore = db.createObjectStore('markers', { keyPath: 'id' });
        markerStore.createIndex('audioId', 'audioId', { unique: false });
      }

      // Create playlists store
      if (!db.objectStoreNames.contains('playlists')) {
        const playlistStore = db.createObjectStore('playlists', { keyPath: 'id' });
        playlistStore.createIndex('cachedAt', 'cachedAt', { unique: false });
      }
    };
  });
}

/**
 * Generic function to get item from store
 */
async function getFromStore<T>(storeName: StoreName, key: string): Promise<T | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(key);

    request.onerror = () => reject(new Error(request.error?.message ?? 'IndexedDB get error'));
    request.onsuccess = () => resolve(request.result as T | undefined);
    
    transaction.oncomplete = () => db.close();
  });
}

/**
 * Generic function to put item in store
 */
async function putInStore<T>(storeName: StoreName, item: T): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(item);

    request.onerror = () => reject(new Error(request.error?.message ?? 'IndexedDB put error'));
    request.onsuccess = () => resolve();
    
    transaction.oncomplete = () => db.close();
  });
}

/**
 * Generic function to get all items from store
 */
async function getAllFromStore<T>(storeName: StoreName): Promise<T[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    request.onerror = () => reject(new Error(request.error?.message ?? 'IndexedDB getAll error'));
    request.onsuccess = () => resolve(request.result as T[]);
    
    transaction.oncomplete = () => db.close();
  });
}

/**
 * Generic function to delete item from store
 */
async function deleteFromStore(storeName: StoreName, key: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(key);

    request.onerror = () => reject(new Error(request.error?.message ?? 'IndexedDB delete error'));
    request.onsuccess = () => resolve();
    
    transaction.oncomplete = () => db.close();
  });
}

// ============ Audio Functions ============

export async function saveAudioOffline(audio: Omit<AudioMetadata, 'cachedAt'>): Promise<void> {
  const audioWithTimestamp: AudioMetadata = {
    ...audio,
    cachedAt: Date.now(),
  };
  await putInStore('audios', audioWithTimestamp);
  console.log('[OfflineStorage] Saved audio:', audio.id);
}

export async function getAudioOffline(audioId: string): Promise<AudioMetadata | undefined> {
  return getFromStore<AudioMetadata>('audios', audioId);
}

export async function getAllAudiosOffline(): Promise<AudioMetadata[]> {
  return getAllFromStore<AudioMetadata>('audios');
}

export async function removeAudioOffline(audioId: string): Promise<void> {
  await deleteFromStore('audios', audioId);
  // Also remove associated markers
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('markers', 'readwrite');
    const store = transaction.objectStore('markers');
    const index = store.index('audioId');
    const request = index.openCursor(IDBKeyRange.only(audioId));

    request.onerror = () => reject(new Error(request.error?.message ?? 'IndexedDB cursor error'));
    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      }
    };

    transaction.oncomplete = () => {
      db.close();
      resolve();
    };
  });
}

// ============ Marker Functions ============

export async function saveMarkersOffline(markers: Marker[]): Promise<void> {
  if (markers.length === 0) return;
  
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('markers', 'readwrite');
    const store = transaction.objectStore('markers');

    markers.forEach((marker) => {
      store.put(marker);
    });

    transaction.onerror = () => reject(new Error(transaction.error?.message ?? 'IndexedDB transaction error'));
    transaction.oncomplete = () => {
      db.close();
      console.log('[OfflineStorage] Saved', markers.length, 'markers for audio:', markers[0]?.audioId);
      resolve();
    };
  });
}

export async function getMarkersOffline(audioId: string): Promise<Marker[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('markers', 'readonly');
    const store = transaction.objectStore('markers');
    const index = store.index('audioId');
    const request = index.getAll(IDBKeyRange.only(audioId));

    request.onerror = () => reject(new Error(request.error?.message ?? 'IndexedDB getAll error'));
    request.onsuccess = () => {
      // Sort by timestamp
      const markers = (request.result as Marker[]).sort((a, b) => a.timestamp - b.timestamp);
      resolve(markers);
    };
    
    transaction.oncomplete = () => db.close();
  });
}

// ============ Playlist Functions ============

export async function savePlaylistOffline(playlist: Omit<PlaylistMetadata, 'cachedAt'>): Promise<void> {
  const playlistWithTimestamp: PlaylistMetadata = {
    ...playlist,
    cachedAt: Date.now(),
  };
  await putInStore('playlists', playlistWithTimestamp);
  console.log('[OfflineStorage] Saved playlist:', playlist.id);
}

export async function getPlaylistOffline(playlistId: string): Promise<PlaylistMetadata | undefined> {
  return getFromStore<PlaylistMetadata>('playlists', playlistId);
}

export async function getAllPlaylistsOffline(): Promise<PlaylistMetadata[]> {
  return getAllFromStore<PlaylistMetadata>('playlists');
}

export async function removePlaylistOffline(playlistId: string): Promise<void> {
  await deleteFromStore('playlists', playlistId);
}

// ============ Utility Functions ============

/**
 * Check if we're currently offline
 */
export function isOffline(): boolean {
  return typeof navigator !== 'undefined' && !navigator.onLine;
}

/**
 * Check if an audio is available offline (in cache and IndexedDB)
 */
export async function isAudioAvailableOffline(audioId: string): Promise<boolean> {
  try {
    // Check IndexedDB for metadata
    const audio = await getAudioOffline(audioId);
    if (!audio) return false;

    // Check Cache API for audio file
    if ('caches' in window) {
      const cache = await caches.open('audio-marker-audio-v2');
      const audioUrl = `/api/audio/${audioId}/file`;
      const cachedAudio = await cache.match(audioUrl);
      return !!cachedAudio;
    }

    return true; // Assume available if we can't check cache
  } catch (error) {
    console.error('[OfflineStorage] Error checking offline availability:', error);
    return false;
  }
}

/**
 * Clear all offline data
 */
export async function clearAllOfflineData(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['audios', 'markers', 'playlists'], 'readwrite');
    
    transaction.objectStore('audios').clear();
    transaction.objectStore('markers').clear();
    transaction.objectStore('playlists').clear();

    transaction.onerror = () => reject(new Error(transaction.error?.message ?? 'IndexedDB transaction error'));
    transaction.oncomplete = () => {
      db.close();
      console.log('[OfflineStorage] Cleared all offline data');
      resolve();
    };
  });
}

/**
 * Get offline storage statistics
 */
export async function getOfflineStorageStats(): Promise<{
  audioCount: number;
  markerCount: number;
  playlistCount: number;
}> {
  const [audios, markers, playlists] = await Promise.all([
    getAllAudiosOffline(),
    getAllFromStore<Marker>('markers'),
    getAllPlaylistsOffline(),
  ]);

  return {
    audioCount: audios.length,
    markerCount: markers.length,
    playlistCount: playlists.length,
  };
}
