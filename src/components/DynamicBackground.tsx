import { usePlayerStore } from '@/store/playerStore';
import { useDominantColor } from '@/hooks/useDominantColor';
import { motion, AnimatePresence } from 'framer-motion';

export const DynamicBackground = () => {
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const hsl = useDominantColor(currentTrack?.thumbnail);

  return (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden bg-background">
      <AnimatePresence mode="wait">
        <motion.div
          key={hsl}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2 }}
          className="absolute inset-0"
          style={{
            background: `radial-gradient(120% 80% at 20% 0%, hsl(${hsl} / 0.55) 0%, transparent 60%),
                         radial-gradient(100% 70% at 100% 100%, hsl(${hsl} / 0.35) 0%, transparent 55%)`,
          }}
        />
      </AnimatePresence>
    </div>
  );
};
