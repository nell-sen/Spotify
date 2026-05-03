import { create } from 'zustand';
import { Track } from '../types';

interface PlayerState {
  currentTrack: Track | null;
  queue: Track[];
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  currentTime: number;
  duration: number;
  isLooping: boolean;
  isShuffle: boolean;
  
  playTrack: (track: Track) => void;
  pauseTrack: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  addToQueue: (track: Track) => void;
  removeFromQueue: (index: number) => void;
  setVolume: (v: number) => void;
  toggleMute: () => void;
  toggleLoop: () => void;
  toggleShuffle: () => void;
  setCurrentTime: (t: number) => void;
  setDuration: (d: number) => void;
  setIsPlaying: (v: boolean) => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentTrack: null,
  queue: [],
  isPlaying: false,
  volume: 1,
  isMuted: false,
  currentTime: 0,
  duration: 0,
  isLooping: false,
  isShuffle: false,

  playTrack: (track) => set({ currentTrack: track, isPlaying: true }),
  pauseTrack: () => set({ isPlaying: false }),
  nextTrack: () => {
    const { queue, currentTrack, isLooping } = get();
    if (isLooping && currentTrack) {
      set({ currentTime: 0, isPlaying: true });
      return;
    }
    if (queue.length > 0) {
      const next = queue[0];
      set({ currentTrack: next, queue: queue.slice(1), isPlaying: true });
    } else {
      set({ isPlaying: false });
    }
  },
  prevTrack: () => {
    set({ currentTime: 0 }); // Simple implementation for now
  },
  addToQueue: (track) => set((state) => ({ queue: [...state.queue, track] })),
  removeFromQueue: (index) => set((state) => ({ queue: state.queue.filter((_, i) => i !== index) })),
  setVolume: (v) => set({ volume: v }),
  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
  toggleLoop: () => set((state) => ({ isLooping: !state.isLooping })),
  toggleShuffle: () => set((state) => ({ isShuffle: !state.isShuffle })),
  setCurrentTime: (t) => set({ currentTime: t }),
  setDuration: (d) => set({ duration: d }),
  setIsPlaying: (v) => set({ isPlaying: v }),
}));
