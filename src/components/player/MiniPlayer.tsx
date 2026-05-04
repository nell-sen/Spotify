import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  Shuffle, Repeat, List, Maximize2
} from 'lucide-react';
import { usePlayerStore } from '@/store/playerStore';
import { FullscreenPlayer } from './FullscreenPlayer';

export const MiniPlayer = () => {
  const {
    currentTrack, isPlaying, volume, isMuted, isLooping, isShuffle,
    currentTime, duration, queue,
    setIsPlaying, nextTrack, prevTrack, setVolume, toggleMute,
    toggleLoop, toggleShuffle,
  } = usePlayerStore();

  const { seekTo } = usePlayerStore() as any;
  const seekRef = useRef<((t: number) => void) | null>(null);

  const [showQueue, setShowQueue] = useState(false);
  const [showFullscreen, setShowFullscreen] = useState(false);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    const newTime = ratio * duration;
    usePlayerStore.getState().setCurrentTime(newTime);
    const playerSeek = (window as any).__ytSeek;
    if (playerSeek) playerSeek(newTime);
  };

  if (!currentTrack) return null;

  return (
    <>
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-0 left-0 right-0 z-40 glass-dark border-t border-white/10 pb-safe"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        data-testid="mini-player"
      >
        <div className="relative">
          <div
            className="absolute top-0 left-0 right-0 h-0.5 bg-white/10 cursor-pointer"
            onClick={handleSeek}
            data-testid="seekbar"
          >
            <div
              className="h-full bg-gradient-to-r from-primary to-secondary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 px-4 py-3 md:pb-[calc(0.75rem+1px)]" style={{ marginBottom: 'env(safe-area-inset-bottom)' }}>
          <div
            className="relative w-11 h-11 shrink-0 rounded-lg overflow-hidden cursor-pointer md:cursor-default"
            onClick={() => setShowFullscreen(true)}
            data-testid="player-thumbnail"
          >
            <img
              src={currentTrack.thumbnail}
              alt={currentTrack.title}
              className={`w-full h-full object-cover ${isPlaying ? 'animate-spin-slow' : ''}`}
              style={{ borderRadius: '50%' }}
            />
            <div className="absolute inset-0 rounded-full border-2 border-primary/40" />
          </div>

          <div className="flex-1 min-w-0 md:w-48 md:flex-none">
            <p className="text-sm font-semibold truncate">{currentTrack.title}</p>
            <p className="text-xs text-muted-foreground truncate">{currentTrack.artist}</p>
          </div>

          <div className="flex items-center gap-1 md:gap-2">
            <button
              onClick={() => toggleShuffle()}
              className={`hidden md:flex p-2 rounded-lg transition-colors ${isShuffle ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
              data-testid="btn-shuffle"
            >
              <Shuffle size={16} />
            </button>
            <button
              onClick={() => prevTrack()}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
              data-testid="btn-prev"
            >
              <SkipBack size={18} />
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-10 h-10 rounded-full bg-primary flex items-center justify-center neon-glow hover:scale-105 transition-transform"
              data-testid="btn-play-pause"
            >
              {isPlaying ? <Pause size={18} fill="white" className="text-white" /> : <Play size={18} fill="white" className="text-white ml-0.5" />}
            </button>
            <button
              onClick={() => nextTrack()}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
              data-testid="btn-next"
            >
              <SkipForward size={18} />
            </button>
            <button
              onClick={() => toggleLoop()}
              className={`hidden md:flex p-2 rounded-lg transition-colors ${isLooping ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
              data-testid="btn-loop"
            >
              <Repeat size={16} />
            </button>
          </div>

          <div className="hidden md:flex items-center gap-2 ml-2">
            <span className="text-xs text-muted-foreground">{formatTime(currentTime)}</span>
            <span className="text-xs text-muted-foreground">/</span>
            <span className="text-xs text-muted-foreground">{formatTime(duration)}</span>
          </div>

          <div className="hidden md:flex items-center gap-2 ml-2">
            <button
              onClick={() => toggleMute()}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
              data-testid="btn-mute"
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={isMuted ? 0 : volume}
              onChange={e => setVolume(parseFloat(e.target.value))}
              className="w-20 accent-primary cursor-pointer"
              data-testid="volume-slider"
            />
          </div>

          <div className="hidden md:flex items-center gap-2 ml-auto">
            <button
              onClick={() => setShowQueue(!showQueue)}
              className={`p-2 rounded-lg transition-colors ${showQueue ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
              data-testid="btn-queue"
            >
              <List size={16} />
            </button>
            <button
              onClick={() => setShowFullscreen(true)}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
              data-testid="btn-fullscreen"
            >
              <Maximize2 size={16} />
            </button>
          </div>
        </div>

        {showQueue && queue.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="hidden md:block border-t border-white/10 max-h-64 overflow-y-auto"
            data-testid="queue-panel"
          >
            <div className="p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Queue ({queue.length})</p>
              <div className="space-y-2">
                {queue.map((track, i) => (
                  <div key={`${track.id}-${i}`} className="flex items-center gap-3 text-sm">
                    <span className="text-xs text-muted-foreground w-4">{i + 1}</span>
                    <img src={track.thumbnail} alt={track.title} className="w-7 h-7 rounded-md object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-xs font-medium">{track.title}</p>
                      <p className="truncate text-[10px] text-muted-foreground">{track.artist}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground">{track.durationFormatted}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      <FullscreenPlayer isOpen={showFullscreen} onClose={() => setShowFullscreen(false)} />
    </>
  );
};
