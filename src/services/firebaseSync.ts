import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from './firebase';

export interface SharedPlaylist {
  id: string;
  title: string;
  thumbnail: string;
  owner: string;
  addedAt: number;
  description?: string;
}

export interface SadSong {
  id: string; // youtube videoId
  title: string;
  artist: string;
  thumbnail: string;
  duration?: number;
  durationFormatted?: string;
  addedAt: number;
}

export interface AppSettings {
  ytApiKey: string;
  about: string;
  socials: { label: string; url: string; icon: string }[];
}

export const DEFAULT_SETTINGS: AppSettings = {
  ytApiKey: '',
  about:
    'NellMusic — Your premium music experience. Stream any YouTube playlist as pure audio with zero friction. Built with love by Nell.',
  socials: [
    { label: 'Instagram', url: 'https://instagram.com/', icon: 'instagram' },
    { label: 'TikTok', url: 'https://tiktok.com/', icon: 'tiktok' },
    { label: 'WhatsApp', url: 'https://wa.me/', icon: 'whatsapp' },
  ],
};

// Settings
export const SETTINGS_DOC = doc(db, 'settings', 'global');

export const subscribeSettings = (cb: (s: AppSettings) => void) =>
  onSnapshot(SETTINGS_DOC, (snap) => {
    if (!snap.exists()) {
      cb(DEFAULT_SETTINGS);
      return;
    }
    const data = snap.data() as Partial<AppSettings>;
    cb({ ...DEFAULT_SETTINGS, ...data });
  });

export const saveSettings = async (s: Partial<AppSettings>) => {
  await setDoc(SETTINGS_DOC, s, { merge: true });
};

// Shared playlists
const playlistsCol = collection(db, 'sharedPlaylists');

export const subscribeSharedPlaylists = (cb: (p: SharedPlaylist[]) => void) =>
  onSnapshot(query(playlistsCol, orderBy('addedAt', 'desc')), (snap) => {
    cb(snap.docs.map((d) => d.data() as SharedPlaylist));
  });

export const upsertSharedPlaylist = async (p: Omit<SharedPlaylist, 'addedAt'> & { addedAt?: number }) => {
  await setDoc(doc(playlistsCol, p.id), { ...p, addedAt: p.addedAt || Date.now() }, { merge: true });
};

export const removeSharedPlaylist = async (id: string) => {
  await deleteDoc(doc(playlistsCol, id));
};

// Sad songs 2026
const sadCol = collection(db, 'sadSongs2026');

export const subscribeSadSongs = (cb: (s: SadSong[]) => void) =>
  onSnapshot(query(sadCol, orderBy('addedAt', 'desc')), (snap) => {
    cb(snap.docs.map((d) => d.data() as SadSong));
  });

export const upsertSadSong = async (s: Omit<SadSong, 'addedAt'> & { addedAt?: number }) => {
  await setDoc(doc(sadCol, s.id), { ...s, addedAt: s.addedAt || Date.now() }, { merge: true });
};

export const removeSadSong = async (id: string) => {
  await deleteDoc(doc(sadCol, id));
};

// Recommended 2026
const recCol = collection(db, 'recommended2026');

export const subscribeRecommended = (cb: (s: SadSong[]) => void) =>
  onSnapshot(query(recCol, orderBy('addedAt', 'desc')), (snap) => {
    cb(snap.docs.map((d) => d.data() as SadSong));
  });

export const upsertRecommended = async (s: Omit<SadSong, 'addedAt'> & { addedAt?: number }) => {
  await setDoc(doc(recCol, s.id), { ...s, addedAt: s.addedAt || Date.now() }, { merge: true });
};

export const removeRecommended = async (id: string) => {
  await deleteDoc(doc(recCol, id));
};

export { serverTimestamp };
