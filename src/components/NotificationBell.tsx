import { useEffect, useRef, useState } from 'react';
import { Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettingsStore } from '@/store/settingsStore';

const LS_KEY = 'nellspotify_seen_playlist_ids';

const loadSeen = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || '[]');
  } catch {
    return [];
  }
};

const saveSeen = (ids: string[]) => {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(ids));
  } catch {}
};

export const NotificationBell = () => {
  const sharedPlaylists = useSettingsStore((s) => s.sharedPlaylists);
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState<Set<string>>(() => new Set(loadSeen()));
  const ref = useRef<HTMLDivElement>(null);

  // Initial load: mark all current as seen on first run if no record
  useEffect(() => {
    if (sharedPlaylists.length === 0) return;
    if (loadSeen().length === 0) {
      const ids = sharedPlaylists.map((p) => p.id);
      saveSeen(ids);
      setSeen(new Set(ids));
    }
  }, [sharedPlaylists.length]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const unseen = sharedPlaylists.filter((p) => !seen.has(p.id));

  const handleOpen = () => {
    setOpen((v) => {
      const next = !v;
      if (next && unseen.length) {
        const all = sharedPlaylists.map((p) => p.id);
        saveSeen(all);
        setSeen(new Set(all));
      }
      return next;
    });
  };

  return (
    <div className="relative" ref={ref}>
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={handleOpen}
        className="relative p-2 rounded-xl glass hover:bg-white/10 transition"
        aria-label="Notifications"
        data-testid="notif-bell"
      >
        <Bell size={18} className="text-foreground" />
        {unseen.length > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center neon-glow">
            {unseen.length > 9 ? '9+' : unseen.length}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto rounded-2xl glass-dark border border-white/10 shadow-2xl z-50 p-3"
          >
            <p className="text-xs uppercase tracking-wider text-muted-foreground px-2 mb-2">
              Notifications
            </p>
            {sharedPlaylists.length === 0 && (
              <p className="text-sm text-muted-foreground p-3">No playlists yet.</p>
            )}
            {sharedPlaylists.slice(0, 12).map((p) => (
              <a
                key={p.id}
                href={`#/playlist/${p.id}`}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition"
              >
                <img src={p.thumbnail} alt={p.title} className="w-10 h-10 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">New playlist: {p.title}</p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {p.owner} • {new Date(p.addedAt).toLocaleString()}
                  </p>
                </div>
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
