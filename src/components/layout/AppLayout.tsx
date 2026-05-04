import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { MiniPlayer } from '@/components/player/MiniPlayer';
import { YouTubePlayer } from '@/components/player/YouTubePlayer';
import { DynamicBackground } from '@/components/DynamicBackground';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { usePlayerStore } from '@/store/playerStore';
import { Toaster } from 'sonner';

interface AppLayoutProps {
  children: ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  useKeyboardShortcuts();
  const currentTrack = usePlayerStore(s => s.currentTrack);
  const playerVisible = !!currentTrack;

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden relative">
      <DynamicBackground />
      <YouTubePlayer />
      <Sidebar />

      <main
        className="flex-1 overflow-y-auto"
        style={{
          paddingBottom: playerVisible ? '80px' : '0',
        }}
      >
        <div className="md:pb-0 pb-16">
          {children}
        </div>
      </main>

      {playerVisible && <MiniPlayer />}
      <BottomNav />
      <Toaster
        theme="dark"
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(30, 15, 50, 0.9)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(168, 85, 247, 0.2)',
            color: 'white',
          },
        }}
      />
    </div>
  );
};
