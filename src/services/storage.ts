import { Playlist, Track } from '../types';

interface LibraryData {
  playlists: Playlist[];
  favorites: Track[];
  recentlyPlayed: Track[];
  importedPlaylists: Playlist[];
  duplicateIds: string[];
}

export const saveLibrary = (data: Partial<LibraryData>): void => {
  try {
    const existing = loadLibrary() || {} as LibraryData;
    const toSave = { ...existing, ...data };
    if (toSave.duplicateIds instanceof Set) {
      (toSave as any).duplicateIds = Array.from(toSave.duplicateIds);
    }
    localStorage.setItem('streamvibe_library', JSON.stringify(toSave));
  } catch {}
};

export const loadLibrary = (): (LibraryData & { duplicateIds: Set<string> }) | null => {
  try {
    const raw = localStorage.getItem('streamvibe_library');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    parsed.duplicateIds = new Set(parsed.duplicateIds || []);
    return parsed;
  } catch {
    return null;
  }
};

export const savePlayHistory = (trackId: string): void => {
  try {
    const history = getPlayHistory();
    history[trackId] = (history[trackId] || 0) + 1;
    localStorage.setItem('streamvibe_history', JSON.stringify(history));
  } catch {}
};

export const getPlayHistory = (): Record<string, number> => {
  try {
    const raw = localStorage.getItem('streamvibe_history');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

export const saveSearchHistory = (query: string): void => {
  try {
    const history = getSearchHistory();
    const filtered = history.filter(q => q !== query);
    const updated = [query, ...filtered].slice(0, 10);
    localStorage.setItem('streamvibe_search_history', JSON.stringify(updated));
  } catch {}
};

export const getSearchHistory = (): string[] => {
  try {
    const raw = localStorage.getItem('streamvibe_search_history');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const clearSearchHistory = (): void => {
  localStorage.removeItem('streamvibe_search_history');
};

export const getBlockedDuplicateCount = (): number => {
  try {
    const raw = localStorage.getItem('streamvibe_blocked_count');
    return raw ? parseInt(raw, 10) : 0;
  } catch {
    return 0;
  }
};

export const incrementBlockedCount = (count: number): void => {
  try {
    const current = getBlockedDuplicateCount();
    localStorage.setItem('streamvibe_blocked_count', String(current + count));
  } catch {}
};
