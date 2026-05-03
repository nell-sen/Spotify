import { create } from 'zustand';
import { Playlist, Track } from '../types';
import { saveLibrary, loadLibrary } from '../services/storage';

interface LibraryState {
  playlists: Playlist[];
  favorites: Track[];
  recentlyPlayed: Track[];
  importedPlaylists: Playlist[];
  duplicateIds: Set<string>;

  addPlaylist: (playlist: Playlist) => void;
  removePlaylist: (id: string) => void;
  toggleFavorite: (track: Track) => void;
  addRecentlyPlayed: (track: Track) => void;
  isDuplicate: (videoId: string) => boolean;
}

const raw = loadLibrary();
const initialState = {
  playlists: raw?.playlists || [],
  favorites: raw?.favorites || [],
  recentlyPlayed: raw?.recentlyPlayed || [],
  importedPlaylists: raw?.importedPlaylists || [],
  duplicateIds: raw?.duplicateIds instanceof Set
    ? raw.duplicateIds
    : new Set<string>(Array.isArray(raw?.duplicateIds) ? raw.duplicateIds as string[] : []),
};

const persist = (state: Partial<LibraryState>) => {
  const toSave = { ...state, duplicateIds: Array.from(state.duplicateIds || []) };
  saveLibrary(toSave as any);
};

export const useLibraryStore = create<LibraryState>((set, get) => ({
  ...initialState,

  addPlaylist: (playlist) => {
    set((state) => {
      const alreadyExists = state.importedPlaylists.some(p => p.id === playlist.id);
      if (alreadyExists) return state;
      const newDuplicates = new Set(state.duplicateIds);
      playlist.tracks.forEach(t => newDuplicates.add(t.id));
      const newState = {
        ...state,
        importedPlaylists: [...state.importedPlaylists, playlist],
        duplicateIds: newDuplicates,
      };
      persist(newState);
      return newState;
    });
  },

  removePlaylist: (id) => {
    set((state) => {
      const newPlaylists = state.importedPlaylists.filter(p => p.id !== id);
      const allIds = new Set<string>(newPlaylists.flatMap(p => p.tracks.map(t => t.id)));
      const newState = { ...state, importedPlaylists: newPlaylists, duplicateIds: allIds };
      persist(newState);
      return newState;
    });
  },

  toggleFavorite: (track) => {
    set((state) => {
      const isFav = state.favorites.some(f => f.id === track.id);
      const newFavs = isFav ? state.favorites.filter(f => f.id !== track.id) : [...state.favorites, track];
      const newState = { ...state, favorites: newFavs };
      persist(newState);
      return newState;
    });
  },

  addRecentlyPlayed: (track) => {
    set((state) => {
      const filtered = state.recentlyPlayed.filter(t => t.id !== track.id);
      const newState = { ...state, recentlyPlayed: [track, ...filtered].slice(0, 50) };
      persist(newState);
      return newState;
    });
  },

  isDuplicate: (videoId) => {
    return get().duplicateIds.has(videoId);
  },
}));
