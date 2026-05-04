import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  Shuffle, Repeat, Heart, List, ChevronDown
} from 'lucide-react';
import { usePlayerStore } from '@/store/playerStore';
import { useLibraryStore } from '@/store/libraryStore';
import { toast } from 'sonner';

interface FullscreenPlayerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FullscreenPlayer = ({ isOpen, onClose }: FullscreenPlayerProps) => {
  const {
    currentTrack, isPlaying, volume, isMuted, isLooping, isShuffle,
    currentTime, duration, queue,
    setIsPlaying, nextTrack, prevTrack, setVolume, toggleMute,
    toggleLoop, toggleShuffle,
  } = usePlayerStore();

  const { toggleFavorite, favorites } = useLibraryStore();

  const isFav = currentTrack ? favorites.some(f => f.id === currentTrack.id) : false;

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

  const handleFavorite = () => {
    if (!currentTrack) return;
    toggleFavorite(currentTrack);
    toast.success(isFav ? 'Removed from favorites' : 'Added to favorites');
  };

  if (!currentTrack) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="fixed inset-0 z-50 flex flex-col overflow-hidden"
          data-testid="fullscreen-player"
        >
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${currentTrack.thumbnail})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(60px) saturate(2)',
              transform: 'scale(1.2)',
              opacity: 0.4,
            }}
          />
          <div className="absolute inset-0 bg-black/70 backdrop-blur-xl" />

          <div className="relative flex flex-col h-full max-w-lg mx-auto w-full px-6 py-8 gap-6">
            <div className="flex items-center justify-between">
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-white/10 transition-colors"
                data-testid="btn-close-fullscreen"
              >
                <ChevronDown size={24} />
              </button>
              <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Now Playing</span>
              <div className="w-8" />
            </div>

            <div className="flex-1 flex items-center justify-center">
              <motion.div
                animate={{ rotate: isPlaying ? 360 : 0 }}
                transition={{ duration: 8, repeat: isPlaying ? Infinity : 0, ease: 'linear' }}
                className={`relative w-64 h-64 rounded-full overflow-hidden neon-glow ${isPlaying ? 'animate-pulse-glow' : ''}`}
              >
                <img
                  src={currentTrack.thumbnail}
                  alt={currentTrack.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 rounded-full border-4 border-primary/30" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-black/50 border border-white/20" />
                </div>
              </motion.div>
            </div>

            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold truncate glow-text">{currentTrack.title}</h2>
                <p className="text-muted-foreground mt-1">{currentTrack.artist}</p>
              </div>
              <button
                onClick={handleFavorite}
                className={`p-2 ml-4 rounded-xl transition-colors ${isFav ? 'text-accent' : 'text-muted-foreground hover:text-foreground'}`}
                data-testid="btn-fullscreen-favorite"
              >
                <Heart size={22} fill={isFav ? 'currentColor' : 'none'} />
              </button>
            </div>

            <div className="space-y-2">
              <div
                className="h-1.5 bg-white/10 rounded-full cursor-pointer relative overflow-hidden"
                onClick={handleSeek}
                data-testid="fullscreen-seekbar"
              >
                <div
                  className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-6">
              <button
                onClick={() => toggleShuffle()}
                className={`p-2 rounded-xl transition-colors ${isShuffle ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                data-testid="btn-fullscreen-shuffle"
              >
                <Shuffle size={20} />
              </button>
              <button
                onClick={() => prevTrack()}
                className="p-3 rounded-xl text-foreground hover:bg-white/10 transition-colors"
                data-testid="btn-fullscreen-prev"
              >
                <SkipBack size={28} />
              </button>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-16 h-16 rounded-full bg-primary flex items-center justify-center neon-glow hover:scale-105 transition-transform"
                data-testid="btn-fullscreen-play-pause"
              >
                {isPlaying
                  ? <Pause size={28} fill="white" className="text-white" />
                  : <Play size={28} fill="white" className="text-white ml-1" />
                }
              </button>
              <button
                onClick={() => nextTrack()}
                className="p-3 rounded-xl text-foreground hover:bg-white/10 transition-colors"
                data-testid="btn-fullscreen-next"
              >
                <SkipForward size={28} />
              </button>
              <button
                onClick={() => toggleLoop()}
                className={`p-2 rounded-xl transition-colors ${isLooping ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                data-testid="btn-fullscreen-loop"
              >
                <Repeat size={20} />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button onClick={() => toggleMute()} className="text-muted-foreground hover:text-foreground transition-colors">
                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={isMuted ? 0 : volume}
                onChange={e => setVolume(parseFloat(e.target.value))}
                className="flex-1 accent-primary cursor-pointer"
                data-testid="fullscreen-volume-slider"
              />
            </div>

            {queue.length > 0 && (
              <div className="max-h-32 overflow-y-auto">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Up Next ({queue.length})</p>
                <div className="space-y-2">
                  {queue.slice(0, 3).map((t, i) => (
                    <div key={`${t.id}-${i}`} className="flex items-center gap-2 text-xs">
                      <img src={t.thumbnail} alt={t.title} className="w-6 h-6 rounded-md object-cover" />
                      <span className="truncate text-muted-foreground">{t.title}</span>
                    </div>
                  ))}
                  {queue.length > 3 && <p className="text-[10px] text-muted-foreground">+{queue.length - 3} more</p>}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
