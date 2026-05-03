import { Link, useLocation } from 'wouter';
import { Home, Search, Library, Heart, Music2, BarChart3 } from 'lucide-react';
import { useLibraryStore } from '@/store/libraryStore';
import { usePlayerStore } from '@/store/playerStore';
import { motion } from 'framer-motion';

const navItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/search', icon: Search, label: 'Search' },
  { href: '/library', icon: Library, label: 'Library' },
  { href: '/favorites', icon: Heart, label: 'Favorites' },
  { href: '/admin', icon: BarChart3, label: 'Dashboard' },
];

export const Sidebar = () => {
  const [location] = useLocation();
  const { recentlyPlayed } = useLibraryStore();
  const { playTrack, currentTrack } = usePlayerStore();

  return (
    <aside className="hidden md:flex flex-col w-64 shrink-0 h-screen sticky top-0 glass-dark border-r border-white/10 overflow-y-auto z-40" data-testid="sidebar">
      <div className="p-6">
        <Link href="/">
          <div className="flex items-center gap-3 mb-8 cursor-pointer">
            <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center neon-glow">
              <Music2 size={20} className="text-primary" />
            </div>
            <span className="text-xl font-bold glow-text bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Nellspotify
            </span>
          </div>
        </Link>

        <nav className="space-y-1" data-testid="sidebar-nav">
          {navItems.map(({ href, icon: Icon, label }) => {
            const active = location === href || (href !== '/' && location.startsWith(href));
            return (
              <Link key={href} href={href}>
                <motion.div
                  whileHover={{ x: 4 }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                    active
                      ? 'bg-primary/20 text-primary neon-glow'
                      : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                  }`}
                  data-testid={`sidebar-nav-${label.toLowerCase()}`}
                >
                  <Icon size={18} />
                  <span className="font-medium text-sm">{label}</span>
                </motion.div>
              </Link>
            );
          })}
        </nav>
      </div>

      {recentlyPlayed.length > 0 && (
        <div className="px-6 pb-6 mt-auto">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Recently Played</p>
          <div className="space-y-2">
            {recentlyPlayed.slice(0, 5).map((track) => (
              <motion.div
                key={track.id}
                whileHover={{ x: 2 }}
                onClick={() => playTrack(track)}
                className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all hover:bg-white/5 ${
                  currentTrack?.id === track.id ? 'bg-primary/10' : ''
                }`}
                data-testid={`sidebar-recent-${track.id}`}
              >
                <div className="relative w-8 h-8 rounded-md overflow-hidden shrink-0">
                  <img src={track.thumbnail} alt={track.title} className="w-full h-full object-cover" />
                  {currentTrack?.id === track.id && (
                    <div className="absolute inset-0 bg-primary/40 flex items-center justify-center">
                      <div className="flex gap-0.5">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="w-0.5 bg-white rounded-full animate-bounce" style={{ height: 8, animationDelay: `${i * 0.1}s` }} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium truncate">{track.title}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{track.artist}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
};
