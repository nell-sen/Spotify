import { motion } from 'framer-motion';
import { Heart, Play, Shuffle, Music2 } from 'lucide-react';
import { useLibraryStore } from '@/store/libraryStore';
import { usePlayerStore } from '@/store/playerStore';
import { TrackCard } from '@/components/TrackCard';
import { toast } from 'sonner';
import { Link } from 'wouter';

export const FavoritesPage = () => {
  const { favorites } = useLibraryStore();
  const { playTrack, addToQueue } = usePlayerStore();

  const handlePlayAll = () => {
    if (!favorites.length) return;
    playTrack(favorites[0]);
    favorites.slice(1).forEach(t => addToQueue(t));
    toast.success(`Playing ${favorites.length} favorites`);
  };

  const handleShuffle = () => {
    if (!favorites.length) return;
    const shuffled = [...favorites].sort(() => Math.random() - 0.5);
    playTrack(shuffled[0]);
    shuffled.slice(1).forEach(t => addToQueue(t));
    toast.success('Shuffling favorites');
  };

  const totalDuration = favorites.reduce((acc, t) => acc + t.duration, 0);
  const formatTotal = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m} min`;
  };

  return (
    <div className="min-h-full px-6 py-10" data-testid="favorites-page">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
            <Heart size={20} className="text-accent" fill="currentColor" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
              Favorites
            </h1>
            {favorites.length > 0 && (
              <p className="text-sm text-muted-foreground">
                {favorites.length} track{favorites.length > 1 ? 's' : ''} · {formatTotal(totalDuration)}
              </p>
            )}
          </div>
        </div>

        {favorites.length > 0 && (
          <div className="flex gap-3 mt-6">
            <button
              onClick={handlePlayAll}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-semibold neon-glow hover:bg-primary/90 transition-colors"
              data-testid="btn-play-all-favorites"
            >
              <Play size={16} fill="white" />
              Play All
            </button>
            <button
              onClick={handleShuffle}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl glass border-white/10 font-semibold hover:bg-white/10 transition-colors"
              data-testid="btn-shuffle-favorites"
            >
              <Shuffle size={16} />
              Shuffle
            </button>
          </div>
        )}
      </motion.div>

      {favorites.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-24 text-center"
          data-testid="favorites-empty"
        >
          <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mb-6">
            <Heart size={36} className="text-accent/50" />
          </div>
          <h3 className="text-xl font-bold mb-2">No favorites yet</h3>
          <p className="text-muted-foreground mb-6 max-w-xs">
            Like songs while browsing playlists and they will show up here.
          </p>
          <Link href="/search">
            <button className="flex items-center gap-2 px-6 py-3 rounded-2xl glass border-white/10 font-semibold hover:bg-white/10 transition-colors">
              <Music2 size={16} />
              Discover Music
            </button>
          </Link>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-1"
          data-testid="favorites-list"
        >
          {favorites.map((track, i) => (
            <TrackCard key={track.id} track={track} index={i} />
          ))}
        </motion.div>
      )}
    </div>
  );
};
