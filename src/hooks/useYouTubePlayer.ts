import { useEffect, useRef, useCallback } from 'react';
import { usePlayerStore } from '@/store/playerStore';
import { useLibraryStore } from '@/store/libraryStore';
import { savePlayHistory } from '@/services/storage';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

let ytApiLoaded = false;
let ytApiLoading = false;

const loadYouTubeAPI = (): Promise<void> => {
  return new Promise((resolve) => {
    if (ytApiLoaded && window.YT) { resolve(); return; }
    if (ytApiLoading) {
      const orig = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => { orig?.(); resolve(); };
      return;
    }
    ytApiLoading = true;
    window.onYouTubeIframeAPIReady = () => { ytApiLoaded = true; resolve(); };
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);
  });
};

export const useYouTubePlayer = (containerId: string) => {
  const playerRef = useRef<any>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentVideoIdRef = useRef<string | null>(null);

  const {
    currentTrack,
    isPlaying,
    volume,
    isMuted,
    isLooping,
    currentTime,
    setCurrentTime,
    setDuration,
    setIsPlaying,
    nextTrack,
  } = usePlayerStore();

  const { addRecentlyPlayed } = useLibraryStore();

  const startPolling = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      if (playerRef.current?.getCurrentTime) {
        try {
          const ct = playerRef.current.getCurrentTime() || 0;
          setCurrentTime(ct);
        } catch {}
      }
    }, 500);
  }, [setCurrentTime]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
  }, []);

  useEffect(() => {
    let cancelled = false;
    loadYouTubeAPI().then(() => {
      if (cancelled) return;
      playerRef.current = new window.YT.Player(containerId, {
        width: '1',
        height: '1',
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          rel: 0,
          modestbranding: 1,
          iv_load_policy: 3,
          origin: window.location.origin,
        },
        events: {
          onReady: () => {},
          onStateChange: (event: any) => {
            const state = event.data;
            if (state === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
              try { setDuration(playerRef.current.getDuration() || 0); } catch {}
              startPolling();
            } else if (state === window.YT.PlayerState.PAUSED) {
              setIsPlaying(false);
              stopPolling();
            } else if (state === window.YT.PlayerState.ENDED) {
              stopPolling();
              if (isLooping && currentVideoIdRef.current) {
                playerRef.current.seekTo(0);
                playerRef.current.playVideo();
              } else {
                nextTrack();
              }
            }
          },
          onError: () => { nextTrack(); },
        },
      });
    });
    return () => { cancelled = true; stopPolling(); };
  }, [containerId]);

  useEffect(() => {
    if (!playerRef.current?.loadVideoById) return;
    if (!currentTrack) { playerRef.current.stopVideo?.(); return; }
    if (currentTrack.id === currentVideoIdRef.current) return;
    currentVideoIdRef.current = currentTrack.id;
    addRecentlyPlayed(currentTrack);
    savePlayHistory(currentTrack.id);
    try { playerRef.current.loadVideoById(currentTrack.id); } catch {}
  }, [currentTrack?.id]);

  useEffect(() => {
    if (!playerRef.current) return;
    try {
      if (isPlaying) { playerRef.current.playVideo?.(); }
      else { playerRef.current.pauseVideo?.(); }
    } catch {}
  }, [isPlaying]);

  useEffect(() => {
    if (!playerRef.current) return;
    try {
      const vol = isMuted ? 0 : Math.round(volume * 100);
      playerRef.current.setVolume?.(vol);
    } catch {}
  }, [volume, isMuted]);

  const seekTo = useCallback((seconds: number) => {
    try { playerRef.current?.seekTo?.(seconds, true); setCurrentTime(seconds); } catch {}
  }, [setCurrentTime]);

  // Expose seekTo globally so MiniPlayer/FullscreenPlayer can call it
  useEffect(() => {
    (window as any).__ytSeek = seekTo;
    return () => { delete (window as any).__ytSeek; };
  }, [seekTo]);

  // Media Session API → notification controls (mobile lockscreen + desktop)
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;
    if (!currentTrack) {
      navigator.mediaSession.metadata = null;
      return;
    }
    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentTrack.title,
      artist: currentTrack.artist,
      album: 'NellMusic',
      artwork: [96, 192, 256, 384, 512].map((s) => ({
        src: currentTrack.thumbnail,
        sizes: `${s}x${s}`,
        type: 'image/jpeg',
      })),
    });
    const handlers: [MediaSessionAction, () => void][] = [
      ['play', () => { try { playerRef.current?.playVideo?.(); } catch {} setIsPlaying(true); }],
      ['pause', () => { try { playerRef.current?.pauseVideo?.(); } catch {} setIsPlaying(false); }],
      ['previoustrack', () => usePlayerStore.getState().prevTrack()],
      ['nexttrack', () => usePlayerStore.getState().nextTrack()],
      ['seekbackward', () => seekTo(Math.max(0, (playerRef.current?.getCurrentTime?.() || 0) - 10))],
      ['seekforward', () => seekTo((playerRef.current?.getCurrentTime?.() || 0) + 10)],
    ];
    handlers.forEach(([a, h]) => { try { navigator.mediaSession.setActionHandler(a, h); } catch {} });
    return () => {
      handlers.forEach(([a]) => { try { navigator.mediaSession.setActionHandler(a, null); } catch {} });
    };
  }, [currentTrack?.id, seekTo, setIsPlaying]);

  useEffect(() => {
    if (!('mediaSession' in navigator)) return;
    try {
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    } catch {}
  }, [isPlaying]);

  return { seekTo };
};
