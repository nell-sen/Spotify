import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3, Music2, ListMusic, ShieldOff, Clock, Lock, KeyRound,
  Trash2, Plus, Save, HeartCrack, Share2, LogOut, Info,
} from 'lucide-react';
import { toast } from 'sonner';
import { useLibraryStore } from '@/store/libraryStore';
import { useSettingsStore } from '@/store/settingsStore';
import { getPlayHistory, getBlockedDuplicateCount } from '@/services/storage';
import {
  saveSettings, upsertSharedPlaylist, removeSharedPlaylist,
  upsertSadSong, removeSadSong, upsertRecommended, removeRecommended, AppSettings,
} from '@/services/firebaseSync';
import {
  extractPlaylistId, extractVideoId, fetchPlaylistInfo, fetchVideo, formatDuration, normalizeDuration,
} from '@/services/youtube';
import axios from 'axios';
import { getCurrentApiKey } from '@/store/settingsStore';

const ADMIN_PASSWORD = 'Ishnelsen060906';
const AUTH_KEY = 'nellspotify_admin_authed';

const Login = ({ onAuth }: { onAuth: () => void }) => {
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pw === ADMIN_PASSWORD) {
      sessionStorage.setItem(AUTH_KEY, '1');
      onAuth();
    } else {
      setErr('Wrong password');
    }
  };
  return (
    <div className="min-h-full flex items-center justify-center px-6 py-20">
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={submit}
        className="glass rounded-3xl p-8 w-full max-w-sm"
      >
        <div className="flex items-center gap-3 mb-6">
          <Lock size={22} className="text-primary" />
          <h1 className="text-xl font-bold">Admin Panel</h1>
        </div>
        <input
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          placeholder="Enter password"
          className="w-full px-4 py-3 rounded-xl bg-background/50 border border-white/10 focus:border-primary outline-none transition"
          autoFocus
        />
        {err && <p className="text-xs text-destructive mt-2">{err}</p>}
        <button
          type="submit"
          className="w-full mt-4 py-3 rounded-xl bg-primary text-primary-foreground font-semibold neon-glow hover:bg-primary/90"
        >
          Unlock
        </button>
      </motion.form>
    </div>
  );
};

const Section = ({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    className="glass rounded-2xl p-6 mb-6"
  >
    <div className="flex items-center gap-2 mb-4">
      <Icon size={16} className="text-primary" />
      <h2 className="font-semibold">{title}</h2>
    </div>
    {children}
  </motion.div>
);

const Dashboard = () => {
  const { importedPlaylists, favorites, recentlyPlayed } = useLibraryStore();
  const { sharedPlaylists, sadSongs, settings } = useSettingsStore();
  const playHistory = getPlayHistory();
  const blockedCount = getBlockedDuplicateCount();

  const totalTracks = importedPlaylists.reduce((acc, p) => acc + p.trackCount, 0);
  const totalDuration = importedPlaylists.reduce(
    (acc, p) => acc + p.tracks.reduce((sum, t) => sum + t.duration, 0), 0);

  const formatHours = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const stats = [
    { icon: ListMusic, label: 'Playlists', value: importedPlaylists.length, color: 'text-primary', bg: 'bg-primary/10' },
    { icon: Music2, label: 'Total Tracks', value: totalTracks, color: 'text-secondary', bg: 'bg-secondary/10' },
    { icon: Clock, label: 'Duration', value: formatHours(totalDuration), color: 'text-accent', bg: 'bg-accent/10' },
    { icon: ShieldOff, label: 'Dup. Blocked', value: blockedCount, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
    { icon: Share2, label: 'Shared Playlists', value: sharedPlaylists.length, color: 'text-primary', bg: 'bg-primary/10' },
    { icon: HeartCrack, label: 'Sad Songs', value: sadSongs.length, color: 'text-accent', bg: 'bg-accent/10' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
      {stats.map(({ icon: Icon, label, value, color, bg }) => (
        <div key={label} className="glass rounded-2xl p-5">
          <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
            <Icon size={20} className={color} />
          </div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground mt-1">{label}</p>
        </div>
      ))}
    </div>
  );
};

const ApiKeyManager = () => {
  const settings = useSettingsStore((s) => s.settings);
  const [key, setKey] = useState(settings.ytApiKey);
  useEffect(() => setKey(settings.ytApiKey), [settings.ytApiKey]);

  const save = async () => {
    try {
      await saveSettings({ ytApiKey: key });
      toast.success('YouTube API key saved');
    } catch (e: any) {
      toast.error(e.message || 'Failed to save');
    }
  };

  return (
    <Section title="YouTube API Key" icon={KeyRound}>
      <p className="text-xs text-muted-foreground mb-3">
        Synced across all users via Firebase. Leave empty to use the build-time fallback.
      </p>
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="AIza..."
          className="flex-1 px-4 py-2 rounded-xl bg-background/50 border border-white/10 focus:border-primary outline-none font-mono text-sm"
        />
        <button onClick={save} className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2">
          <Save size={14} /> Save
        </button>
      </div>
      <p className="text-[11px] text-muted-foreground mt-2">
        Currently active: <span className="font-mono text-primary">{getCurrentApiKey().slice(0, 12)}…</span>
      </p>
    </Section>
  );
};

const PlaylistsManager = () => {
  const sharedPlaylists = useSettingsStore((s) => s.sharedPlaylists);
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const add = async () => {
    const id = extractPlaylistId(url);
    if (!id) { toast.error('Invalid playlist URL'); return; }
    setLoading(true);
    try {
      const info = await fetchPlaylistInfo(id);
      await upsertSharedPlaylist({
        id,
        title: info?.snippet?.title || 'Untitled',
        thumbnail: info?.snippet?.thumbnails?.high?.url || info?.snippet?.thumbnails?.default?.url || '',
        owner: info?.snippet?.channelTitle || 'Unknown',
        description: info?.snippet?.description || '',
      });
      toast.success('Playlist added & synced');
      setUrl('');
    } catch (e: any) {
      toast.error(e.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Section title="Trending Playlists (synced)" icon={Share2}>
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://youtube.com/playlist?list=..."
          className="flex-1 px-4 py-2 rounded-xl bg-background/50 border border-white/10 focus:border-primary outline-none text-sm"
        />
        <button
          disabled={loading}
          onClick={add}
          className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
        >
          <Plus size={14} /> {loading ? 'Adding…' : 'Add'}
        </button>
      </div>
      <div className="space-y-2 max-h-72 overflow-y-auto">
        {sharedPlaylists.length === 0 && <p className="text-sm text-muted-foreground">No playlists yet.</p>}
        {sharedPlaylists.map((p) => (
          <div key={p.id} className="flex items-center gap-3 p-2 rounded-xl bg-background/40">
            <img src={p.thumbnail} alt={p.title} className="w-10 h-10 rounded-lg object-cover" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{p.title}</p>
              <p className="text-[11px] text-muted-foreground truncate">{p.owner}</p>
            </div>
            <button
              onClick={() => removeSharedPlaylist(p.id).then(() => toast.success('Removed'))}
              className="p-2 rounded-lg hover:bg-destructive/20 text-destructive"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </Section>
  );
};

const SadSongsManager = () => {
  const sadSongs = useSettingsStore((s) => s.sadSongs);
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const add = async () => {
    const id = extractVideoId(url);
    if (!id) { toast.error('Invalid video URL'); return; }
    setLoading(true);
    try {
      const t = await fetchVideo(id);
      await upsertSadSong({
        id: t.id,
        title: t.title,
        artist: t.artist,
        thumbnail: t.thumbnail,
        duration: t.duration,
        durationFormatted: t.durationFormatted,
      });
      toast.success('Song added');
      setUrl('');
    } catch (e: any) {
      toast.error(e.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Section title="Lagu Galau 2026" icon={HeartCrack}>
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://youtube.com/watch?v=..."
          className="flex-1 px-4 py-2 rounded-xl bg-background/50 border border-white/10 focus:border-primary outline-none text-sm"
        />
        <button
          disabled={loading}
          onClick={add}
          className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
        >
          <Plus size={14} /> {loading ? 'Adding…' : 'Add'}
        </button>
      </div>
      <div className="space-y-2 max-h-72 overflow-y-auto">
        {sadSongs.length === 0 && <p className="text-sm text-muted-foreground">No songs yet.</p>}
        {sadSongs.map((s) => (
          <div key={s.id} className="flex items-center gap-3 p-2 rounded-xl bg-background/40">
            <img src={s.thumbnail} alt={s.title} className="w-10 h-10 rounded-lg object-cover" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{s.title}</p>
              <p className="text-[11px] text-muted-foreground truncate">{s.artist}</p>
            </div>
            <button
              onClick={() => removeSadSong(s.id).then(() => toast.success('Removed'))}
              className="p-2 rounded-lg hover:bg-destructive/20 text-destructive"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </Section>
  );
};

const RecommendedManager = () => {
  const recommended = useSettingsStore((s) => s.recommended);
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const add = async () => {
    const id = extractVideoId(url);
    if (!id) { toast.error('Invalid video URL'); return; }
    setLoading(true);
    try {
      const t = await fetchVideo(id);
      await upsertRecommended({
        id: t.id, title: t.title, artist: t.artist, thumbnail: t.thumbnail,
        duration: t.duration, durationFormatted: t.durationFormatted,
      });
      toast.success('Recommended song added');
      setUrl('');
    } catch (e: any) { toast.error(e.message || 'Failed'); }
    finally { setLoading(false); }
  };

  return (
    <Section title="Rekomendasi Lagu 2026" icon={Music2}>
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <input value={url} onChange={(e) => setUrl(e.target.value)}
          placeholder="https://youtube.com/watch?v=..."
          className="flex-1 px-4 py-2 rounded-xl bg-background/50 border border-white/10 focus:border-primary outline-none text-sm" />
        <button disabled={loading} onClick={add}
          className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 disabled:opacity-60">
          <Plus size={14} /> {loading ? 'Adding…' : 'Add'}
        </button>
      </div>
      <div className="space-y-2 max-h-72 overflow-y-auto">
        {recommended.length === 0 && <p className="text-sm text-muted-foreground">No songs yet.</p>}
        {recommended.map((s) => (
          <div key={s.id} className="flex items-center gap-3 p-2 rounded-xl bg-background/40">
            <img src={s.thumbnail} alt={s.title} className="w-10 h-10 rounded-lg object-cover" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{s.title}</p>
              <p className="text-[11px] text-muted-foreground truncate">{s.artist}</p>
            </div>
            <button onClick={() => removeRecommended(s.id).then(() => toast.success('Removed'))}
              className="p-2 rounded-lg hover:bg-destructive/20 text-destructive">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </Section>
  );
};

const AboutManager = () => {
  const settings = useSettingsStore((s) => s.settings);
  const [about, setAbout] = useState(settings.about);
  const [socials, setSocials] = useState(settings.socials);

  useEffect(() => {
    setAbout(settings.about);
    setSocials(settings.socials);
  }, [settings.about, settings.socials]);

  const updateSocial = (i: number, field: 'label' | 'url' | 'icon', val: string) => {
    setSocials((s) => s.map((it, idx) => (idx === i ? { ...it, [field]: val } : it)));
  };

  const addSocial = () => setSocials((s) => [...s, { label: 'New', url: 'https://', icon: 'globe' }]);
  const removeSocial = (i: number) => setSocials((s) => s.filter((_, idx) => idx !== i));

  const save = async () => {
    try {
      await saveSettings({ about, socials });
      toast.success('About & socials saved');
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <Section title="About & Socials" icon={Info}>
      <textarea
        value={about}
        onChange={(e) => setAbout(e.target.value)}
        rows={4}
        className="w-full px-4 py-2 rounded-xl bg-background/50 border border-white/10 focus:border-primary outline-none text-sm mb-4"
        placeholder="About NellMusic…"
      />
      <p className="text-xs text-muted-foreground mb-2">Social links (icon: instagram, tiktok, whatsapp, twitter, youtube, facebook, globe)</p>
      <div className="space-y-2 mb-3">
        {socials.map((s, i) => (
          <div key={i} className="grid grid-cols-12 gap-2">
            <input
              value={s.label}
              onChange={(e) => updateSocial(i, 'label', e.target.value)}
              placeholder="Label"
              className="col-span-3 px-3 py-2 rounded-lg bg-background/50 border border-white/10 text-sm"
            />
            <input
              value={s.icon}
              onChange={(e) => updateSocial(i, 'icon', e.target.value)}
              placeholder="icon"
              className="col-span-2 px-3 py-2 rounded-lg bg-background/50 border border-white/10 text-sm"
            />
            <input
              value={s.url}
              onChange={(e) => updateSocial(i, 'url', e.target.value)}
              placeholder="URL"
              className="col-span-6 px-3 py-2 rounded-lg bg-background/50 border border-white/10 text-sm"
            />
            <button
              onClick={() => removeSocial(i)}
              className="col-span-1 rounded-lg hover:bg-destructive/20 text-destructive flex items-center justify-center"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <button onClick={addSocial} className="px-4 py-2 rounded-xl glass border border-white/10 text-sm flex items-center gap-2">
          <Plus size={14} /> Add social
        </button>
        <button onClick={save} className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold flex items-center gap-2">
          <Save size={14} /> Save
        </button>
      </div>
    </Section>
  );
};

export const AdminPanel = () => {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(AUTH_KEY) === '1');

  if (!authed) return <Login onAuth={() => setAuthed(true)} />;

  const logout = () => {
    sessionStorage.removeItem(AUTH_KEY);
    setAuthed(false);
  };

  return (
    <div className="min-h-full px-6 py-10 max-w-5xl mx-auto" data-testid="admin-panel">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <BarChart3 size={22} className="text-primary" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Admin Panel
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">Manage app settings, content & API keys</p>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 px-3 py-2 rounded-xl glass border border-white/10 text-sm hover:bg-white/10"
        >
          <LogOut size={14} /> Logout
        </button>
      </div>

      <Dashboard />
      <ApiKeyManager />
      <PlaylistsManager />
      <SadSongsManager />
      <RecommendedManager />
      <AboutManager />
    </div>
  );
};
