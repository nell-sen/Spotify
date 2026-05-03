import { motion } from 'framer-motion';
import { BarChart3, Music2, ListMusic, ShieldOff, TrendingUp, Clock } from 'lucide-react';
import { useLibraryStore } from '@/store/libraryStore';
import { getPlayHistory, getBlockedDuplicateCount } from '@/services/storage';

export const AdminPanel = () => {
  const { importedPlaylists, favorites, recentlyPlayed } = useLibraryStore();
  const playHistory = getPlayHistory();
  const blockedCount = getBlockedDuplicateCount();

  const totalTracks = importedPlaylists.reduce((acc, p) => acc + p.trackCount, 0);
  const totalDuration = importedPlaylists.reduce(
    (acc, p) => acc + p.tracks.reduce((sum, t) => sum + t.duration, 0),
    0
  );

  const topPlayed = Object.entries(playHistory)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([id, count]) => {
      const track = recentlyPlayed.find(t => t.id === id) ||
        importedPlaylists.flatMap(p => p.tracks).find(t => t.id === id);
      return { id, count, track };
    })
    .filter(e => !!e.track);

  const formatHours = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  const statCards = [
    { icon: ListMusic, label: 'Playlists', value: importedPlaylists.length, color: 'text-primary', bg: 'bg-primary/10' },
    { icon: Music2, label: 'Total Tracks', value: totalTracks, color: 'text-secondary', bg: 'bg-secondary/10' },
    { icon: Clock, label: 'Total Duration', value: formatHours(totalDuration), color: 'text-accent', bg: 'bg-accent/10' },
    { icon: ShieldOff, label: 'Duplicates Blocked', value: blockedCount, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  ];

  return (
    <div className="min-h-full px-6 py-10" data-testid="admin-panel">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <BarChart3 size={22} className="text-primary" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Dashboard
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">Your Nellspotify usage overview</p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {statCards.map(({ icon: Icon, label, value, color, bg }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass rounded-2xl p-5"
            data-testid={`stat-${label.toLowerCase().replace(/\s+/g, '-')}`}
          >
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon size={20} className={color} />
            </div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {topPlayed.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-2xl p-6"
            data-testid="top-played"
          >
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={16} className="text-secondary" />
              <h2 className="font-semibold">Top Played</h2>
            </div>
            <div className="space-y-3">
              {topPlayed.map(({ track, count }, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-4">{i + 1}</span>
                  <img src={track!.thumbnail} alt={track!.title} className="w-8 h-8 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{track!.title}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{track!.artist}</p>
                  </div>
                  <span className="text-xs text-primary font-medium">{count}x</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {importedPlaylists.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass rounded-2xl p-6"
            data-testid="recent-imports"
          >
            <div className="flex items-center gap-2 mb-4">
              <ListMusic size={16} className="text-primary" />
              <h2 className="font-semibold">Recently Imported</h2>
            </div>
            <div className="space-y-3">
              {[...importedPlaylists]
                .sort((a, b) => b.importedAt - a.importedAt)
                .slice(0, 5)
                .map((pl, i) => (
                  <div key={pl.id} className="flex items-center gap-3">
                    <img src={pl.thumbnail} alt={pl.title} className="w-8 h-8 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{pl.title}</p>
                      <p className="text-[11px] text-muted-foreground">{pl.trackCount} tracks</p>
                    </div>
                  </div>
                ))}
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass rounded-2xl p-6"
          data-testid="library-stats"
        >
          <div className="flex items-center gap-2 mb-4">
            <Music2 size={16} className="text-accent" />
            <h2 className="font-semibold">Library Stats</h2>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Favorited tracks', value: favorites.length },
              { label: 'Recently played', value: recentlyPlayed.length },
              { label: 'Unique artists', value: new Set(importedPlaylists.flatMap(p => p.tracks.map(t => t.artist))).size },
              { label: 'Total play count', value: Object.values(playHistory).reduce((a, b) => a + b, 0) },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-semibold">{value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
