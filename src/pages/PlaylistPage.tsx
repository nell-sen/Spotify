import { useState, useEffect } from 'react';
import { useParams } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Shuffle, Search, ArrowLeft, ListMusic, Clock } from 'lucide-react';
import { Link } from 'wouter';
import { useLibraryStore } from '@/store/libraryStore';
import { usePlayerStore } from '@/store/playerStore';
import { fetchPlaylist } from '@/services/youtube';
import { TrackCard } from '@/components/TrackCard';
import { Playlist, Track } from '@/types';
import { toast } from 'sonner';

export const PlaylistPage = () => {
  const { id } = useParams<{ id: string }>();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');

  const { importedPlaylists, addPlaylist } = useLibraryStore();
  const { playTrack, addToQueue } = usePlayerStore();

  useEffect(() => {
    if (!id) return;
    const local = importedPlaylists.find(p => p.id === id);
    if (local) { setPlaylist(local); setLoading(false); return; }

    setLoading(true);
    fetchPlaylist(id)
      .then(pl => { setPlaylist(pl); })
      .catch(() => setError('Could not load playlist. It may be private or unavailable.'))
      .finally(() => setLoading(false));
  }, [id]);

  const filteredTracks = playlist?.tracks.filter(t =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.artist.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const totalDuration = playlist?.tracks.reduce((acc, t) => acc + t.duration, 0) || 0;
  const formatTotalDuration = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m} min`;
  };

  const handlePlayAll = () => {
    if (!playlist?.tracks.length) return;
    playTrack(playlist.tracks[0]);
    playlist.tracks.slice(1).forEach(t => addToQueue(t));
    toast.success(`Playing all ${playlist.tracks.length} tracks`);
  };

  const handleShuffle = () => {
    if (!playlist?.tracks.length) return;
    const shuffled = [...playlist.tracks].sort(() => Math.random() - 0.5);
    playTrack(shuffled[0]);
    shuffled.slice(1).forEach(t => addToQueue(t));
    toast.success('Shuffling playlist');
  };

  const handleImport = () => {
    if (!playlist) return;
    addPlaylist(playlist);
    toast.success(`"${playlist.title}" added to library`);
  };

  if (loading) {
    return (
      <div className="min-h-full" data-testid="playlist-loading">
        <div className="h-64 bg-white/5 animate-pulse" />
        <div className="px-6 py-6 space-y-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-white/5 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-white/5 rounded animate-pulse w-3/4" />
                <div className="h-2 bg-white/5 rounded animate-pulse w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !playlist) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center px-6 py-20 text-center" data-testid="playlist-error">
        <ListMusic size={48} className="text-muted-foreground mb-4" />
        <h2 className="text-xl font-bold mb-2">Playlist unavailable</h2>
        <p className="text-muted-foreground mb-6">{error || 'This playlist could not be loaded.'}</p>
        <Link href="/library">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass hover:bg-white/10 transition-colors">
            <ArrowLeft size={16} />
            Back to Library
          </button>
        </Link>
      </div>
    );
  }

  const isInLibrary = importedPlaylists.some(p => p.id === playlist.id);

  return (
    <div className="min-h-full" data-testid="playlist-page">
      <div className="relative">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url(${playlist.thumbnail})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(40px)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />

        <div className="relative px-6 pt-10 pb-10">
          <Link href="/library">
            <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6" data-testid="btn-back">
              <ArrowLeft size={16} />
              Library
            </button>
          </Link>

          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <motion.img
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              src={playlist.thumbnail}
              alt={playlist.title}
              className="w-48 h-48 rounded-2xl object-cover shadow-2xl neon-glow shrink-0"
            />
            <div className="flex-1 min-w-0">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <p className="text-xs text-primary uppercase tracking-wider mb-2">Playlist</p>
                <h1 className="text-3xl font-bold mb-2 truncate">{playlist.title}</h1>
                <p className="text-sm text-muted-foreground mb-1">{playlist.owner}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-6">
                  <span className="flex items-center gap-1"><ListMusic size={12} />{playlist.trackCount} tracks</span>
                  <span className="flex items-center gap-1"><Clock size={12} />{formatTotalDuration(totalDuration)}</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handlePlayAll}
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-semibold neon-glow hover:bg-primary/90 transition-colors"
                    data-testid="btn-play-all"
                  >
                    <Play size={18} fill="white" />
                    Play All
                  </button>
                  <button
                    onClick={handleShuffle}
                    className="flex items-center gap-2 px-5 py-3 rounded-2xl glass border-white/10 font-semibold hover:bg-white/10 transition-colors"
                    data-testid="btn-shuffle-all"
                  >
                    <Shuffle size={16} />
                    Shuffle
                  </button>
                  {!isInLibrary && (
                    <button
                      onClick={handleImport}
                      className="flex items-center gap-2 px-5 py-3 rounded-2xl glass border-white/10 font-semibold hover:bg-white/10 transition-colors"
                      data-testid="btn-add-to-library"
                    >
                      Add to Library
                    </button>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 pb-10">
        <div className="mb-4 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search in playlist..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm placeholder:text-muted-foreground/50 outline-none focus:border-primary/40 transition-colors"
            data-testid="input-playlist-search"
          />
        </div>

        <div className="space-y-1" data-testid="playlist-tracks">
          <AnimatePresence>
            {filteredTracks.map((track, i) => (
              <TrackCard key={track.id} track={track} index={i} showDuplicate />
            ))}
          </AnimatePresence>
          {filteredTracks.length === 0 && searchQuery && (
            <div className="text-center py-10 text-muted-foreground text-sm">
              No tracks matching "{searchQuery}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
