import { useEffect } from 'react';
import { usePlayerStore } from '@/store/playerStore';

export const useKeyboardShortcuts = () => {
  const { isPlaying, setIsPlaying, nextTrack, prevTrack, isMuted, toggleMute, toggleLoop, toggleShuffle } = usePlayerStore();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          setIsPlaying(!isPlaying);
          break;
        case 'ArrowRight':
          e.preventDefault();
          nextTrack();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          prevTrack();
          break;
        case 'm':
        case 'M':
          toggleMute();
          break;
        case 'l':
        case 'L':
          toggleLoop();
          break;
        case 's':
        case 'S':
          toggleShuffle();
          break;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isPlaying, isMuted, setIsPlaying, nextTrack, prevTrack, toggleMute, toggleLoop, toggleShuffle]);
};
