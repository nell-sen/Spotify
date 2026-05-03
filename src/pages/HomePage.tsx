import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Music2, Clock, Heart, TrendingUp, Play } from 'lucide-react';
import { useLibraryStore } from '@/store/libraryStore';
import { usePlayerStore } from '@/store/playerStore';
import { PlaylistCard } from '@/components/PlaylistCard';
import { TrackCard } from '@/components/TrackCard';
import { ImportModal } from '@/components/ImportModal';
import { Link } from 'wouter';

const TRENDING_PLAYLISTS = [
  {
    id: 'PLrEnWoR732-BHrPp_Pm8_VleD68f9s14-N',
    title: 'Top Global Hits',
    thumbnail: 'https://i.ytimg.com/vi/JGwWNGJdvx8/hqdefault.jpg',
    owner: 'YouTube Music',
  },
  {
    id: 'PLDIoUOhQQPlXr63I_vwF06Dq4p7FMrOHn',
    title: 'Chill Vibes Mix',
    thumbnail: 'https://i.ytimg.com/vi/5qap5aO4i9A/hqdefault.jpg',
    owner: 'YouTube Music',
  },
  {
    id: 'PLw-VjHDlEOgs658kAHR_LAaILBXb-s6Q5',
    title: 'Lo-Fi Hip Hop',
    thumbnail: 'https://i.ytimg.com/vi/jfKfPfyJRdk/hqdefault.jpg',
    owner: 'Lofi Girl',
  },
  {
    id: 'PL4o29bINVT4EG_y-k5jGoOu3-Am8Nyo10',
    title: 'EDM Bangers',
    thumbnail: 'https://i.ytimg.com/vi/iLkDM6XMYxM/hqdefault.jpg',
    owner: 'EDM Nation',
  },
  {
    id: 'PLhd1HyMTk3f4Qm8MRSEBfYDMvNnFp2bRa',
    title: 'Indie Pop Hits',
    thumbnail: 'https://i.ytimg.com/vi/M7lc1UVf-VE/hqdefault.jpg',
    owner: 'Indie World',
  },
  {
    id: 'PLyORnIW1xT6waE-AMUq-R_QFEmLVjFf_X',
    title: 'Phonk Playlist',
    thumbnail: 'https://i.ytimg.com/vi/lkm_j0jEJts/hqdefault.jpg',
    owner: 'Phonk Nation',
  },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export const HomePage = () => {
  const [showImport, setShowImport] = useState(false);
  const { importedPlaylists, recentlyPlayed, favorites } = useLibraryStore();
  const { playTrack, addToQueue } = usePlayerStore();

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const handlePlayAll = (tracks: typeof recentlyPlayed) => {
    if (!tracks.length) return;
    playTrack(tracks[0]);
    tracks.slice(1).forEach(t => addToQueue(t));
  };

  return (
    <div className="min-h-full" data-testid="home-page">
      <div className="relative overflow-hidden px-6 pt-12 pb-16">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/5 pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          <p className="text-muted-foreground text-sm mb-2">{greeting()}</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Nellspotify
            </span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl">
            Your premium music experience. Stream any YouTube playlist — pure audio, zero friction.
          </p>

          <div className="flex flex-wrap gap-3 mt-8">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowImport(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-semibold neon-glow hover:bg-primary/90 transition-colors"
              data-testid="btn-import-playlist"
            >
              <Plus size={18} />
              Import Playlist
            </motion.button>
            {recentlyPlayed.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handlePlayAll(recentlyPlayed)}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl glass border-white/10 font-semibold hover:bg-white/10 transition-colors"
                data-testid="btn-play-recent"
              >
                <Play size={18} />
                Continue Listening
              </motion.button>
            )}
          </div>
        </motion.div>
      </div>

      <div className="px-6 space-y-10 pb-10">
        {recentlyPlayed.length > 0 && (
          <section data-testid="section-recently-played">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-secondary" />
                <h2 className="text-lg font-bold">Recently Played</h2>
              </div>
              <Link href="/favorites">
                <span className="text-xs text-primary hover:underline cursor-pointer">See all</span>
              </Link>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
              {recentlyPlayed.slice(0, 10).map((track, i) => (
                <motion.div
                  key={track.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => playTrack(track)}
                  whileHover={{ y: -4 }}
                  className="shrink-0 w-28 cursor-pointer group"
                  data-testid={`recent-track-${track.id}`}
                >
                  <div className="relative w-28 h-28 rounded-xl overflow-hidden mb-2">
                    <img src={track.thumbnail} alt={track.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Play size={20} fill="white" className="text-white" />
                    </div>
                  </div>
                  <p className="text-xs font-medium truncate">{track.title}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{track.artist}</p>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {favorites.length > 0 && (
          <section data-testid="section-favorites">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Heart size={16} className="text-accent" />
                <h2 className="text-lg font-bold">Favorites</h2>
              </div>
              <Link href="/favorites">
                <span className="text-xs text-primary hover:underline cursor-pointer">See all</span>
              </Link>
            </div>
            <div className="space-y-1">
              {favorites.slice(0, 5).map((track, i) => (
                <TrackCard key={track.id} track={track} index={i} />
              ))}
            </div>
          </section>
        )}

        {importedPlaylists.length > 0 && (
          <section data-testid="section-imported">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Music2 size={16} className="text-primary" />
                <h2 className="text-lg font-bold">Your Library</h2>
              </div>
              <Link href="/library">
                <span className="text-xs text-primary hover:underline cursor-pointer">See all</span>
              </Link>
            </div>
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
            >
              {importedPlaylists.slice(0, 5).map((playlist, i) => (
                <motion.div key={playlist.id} variants={item}>
                  <PlaylistCard playlist={playlist} index={i} />
                </motion.div>
              ))}
            </motion.div>
          </section>
        )}

        <section data-testid="section-trending">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-secondary" />
            <h2 className="text-lg font-bold">Trending Playlists</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {TRENDING_PLAYLISTS.map((pl, i) => (
              <motion.div
                key={pl.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.07 }}
                whileHover={{ y: -4 }}
              >
                <Link href={`/playlist/${pl.id}`}>
                  <div className="glass rounded-2xl overflow-hidden cursor-pointer group" data-testid={`trending-playlist-${pl.id}`}>
                    <div className="relative aspect-square overflow-hidden">
                      <img
                        src={pl.thumbnail}
                        alt={pl.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${pl.id}/200/200`;
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-10 h-10 rounded-full bg-primary/90 flex items-center justify-center neon-glow">
                          <Play size={16} fill="white" className="text-white ml-0.5" />
                        </div>
                      </div>
                    </div>
                    <div className="p-2.5">
                      <p className="text-xs font-semibold truncate">{pl.title}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{pl.owner}</p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {importedPlaylists.length === 0 && recentlyPlayed.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16 text-center"
            data-testid="empty-state"
          >
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6 neon-glow">
              <Music2 size={36} className="text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Start your journey</h3>
            <p className="text-muted-foreground mb-6 max-w-xs">
              Import any YouTube playlist or video to start streaming. Your library will appear here.
            </p>
            <button
              onClick={() => setShowImport(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-semibold neon-glow"
              data-testid="btn-empty-import"
            >
              <Plus size={18} />
              Import Your First Playlist
            </button>
          </motion.div>
        )}
      </div>

      <ImportModal isOpen={showImport} onClose={() => setShowImport(false)} />
    </div>
  );
};
