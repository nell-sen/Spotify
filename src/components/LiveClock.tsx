import { useEffect, useState } from 'react';
import { useSettingsStore } from '@/store/settingsStore';
import { Calendar } from 'lucide-react';

export const LiveClock = () => {
  const [now, setNow] = useState(new Date());
  const [city, setCity] = useState<string>('');

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz) setCity(tz.split('/').pop()!.replace(/_/g, ' '));
    } catch {}
  }, []);

  const dateStr = now.toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const timeStr = now.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <div className="flex items-center gap-3 mt-2 text-muted-foreground">
      <Calendar size={16} className="text-primary" />
      <div className="text-sm md:text-base">
        <span className="font-medium text-foreground">{dateStr}</span>
        <span className="mx-2 opacity-50">•</span>
        <span className="font-mono text-primary">{timeStr}</span>
        {city && (
          <>
            <span className="mx-2 opacity-50">•</span>
            <span className="text-xs opacity-80">{city}</span>
          </>
        )}
      </div>
    </div>
  );
};

export const useLiveSettings = () => useSettingsStore((s) => s.settings);
