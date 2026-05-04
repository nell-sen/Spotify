import { Link, useLocation } from 'wouter';
import { Home, Search, Library, Heart } from 'lucide-react';

const navItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/search', icon: Search, label: 'Search' },
  { href: '/library', icon: Library, label: 'Library' },
  { href: '/favorites', icon: Heart, label: 'Favorites' },
];

export const BottomNav = () => {
  const [location] = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-dark border-t border-white/10" data-testid="bottom-nav">
      <div className="flex items-center justify-around py-2">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = location === href || (href !== '/' && location.startsWith(href));
          return (
            <Link key={href} href={href}>
              <div
                className={`flex flex-col items-center gap-1 px-4 py-1 rounded-xl transition-all ${
                  active ? 'text-primary' : 'text-muted-foreground'
                }`}
                data-testid={`nav-${label.toLowerCase()}`}
              >
                <Icon size={20} className={active ? 'neon-glow' : ''} />
                <span className="text-[10px] font-medium">{label}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
