import { useState } from 'react';
import { motion } from 'framer-motion';
import { Library, Plus, Music2 } from 'lucide-react';
import { useLibraryStore } from '@/store/libraryStore';
import { PlaylistCard } from '@/components/PlaylistCard';
import { ImportModal } from '@/components/ImportModal';

export const LibraryPage = () => {
  const [showImport, setShowImport] = useState(false);
  const { importedPlaylists } = useLibraryStore();

  const totalTracks = importedPlaylists.reduce((acc, p) => acc + p.trackCount, 0);

  return (
    <div className="min-h-full px-6 py-10" data-testid="library-page">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Library size={20} className="text-primary" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Your Library
              </h1>
            </div>
            {importedPlaylists.length > 0 && (
              <p className="text-sm text-muted-foreground">
                {importedPlaylists.length} playlist{importedPlaylists.length > 1 ? 's' : ''} · {totalTracks} tracks
              </p>
            )}
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setShowImport(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-primary text-primary-foreground font-medium neon-glow hover:bg-primary/90 transition-colors"
            data-testid="btn-import"
          >
            <Plus size={16} />
            Import
          </motion.button>
        </div>
      </motion.div>

      {importedPlaylists.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-24 text-center"
          data-testid="library-empty"
        >
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6 neon-glow">
            <Music2 size={36} className="text-primary" />
          </div>
          <h3 className="text-xl font-bold mb-2">Your library is empty</h3>
          <p className="text-muted-foreground mb-6 max-w-xs">
            Import YouTube playlists or videos to build your personal music library.
          </p>
          <button
            onClick={() => setShowImport(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-semibold neon-glow"
            data-testid="btn-empty-import"
          >
            <Plus size={18} />
            Import Playlist
          </button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
          data-testid="library-grid"
        >
          {importedPlaylists.map((playlist, i) => (
            <PlaylistCard key={playlist.id} playlist={playlist} showDelete index={i} />
          ))}
        </motion.div>
      )}

      <ImportModal isOpen={showImport} onClose={() => setShowImport(false)} />
    </div>
  );
};
