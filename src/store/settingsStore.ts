import { create } from 'zustand';
import {
  AppSettings,
  DEFAULT_SETTINGS,
  SharedPlaylist,
  SadSong,
  subscribeSettings,
  subscribeSharedPlaylists,
  subscribeSadSongs,
  subscribeRecommended,
} from '@/services/firebaseSync';
import { notifyNewItem, seedSeen } from '@/services/pushNotifications';

interface SettingsState {
  settings: AppSettings;
  sharedPlaylists: SharedPlaylist[];
  sadSongs: SadSong[];
  recommended: SadSong[];
  initialized: boolean;
  init: () => void;
}

let unsubFns: (() => void)[] = [];
let firstPlaylistsLoad = true;

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  sharedPlaylists: [],
  sadSongs: [],
  recommended: [],
  initialized: false,

  init: () => {
    if (get().initialized) return;
    set({ initialized: true });
    unsubFns.push(subscribeSettings((settings) => set({ settings })));
    unsubFns.push(
      subscribeSharedPlaylists((sharedPlaylists) => {
        set({ sharedPlaylists });
        if (firstPlaylistsLoad) {
          firstPlaylistsLoad = false;
          seedSeen(sharedPlaylists.map((p) => p.id));
        } else {
          // notify for new ones
          sharedPlaylists.slice(0, 5).forEach((p) => {
            notifyNewItem({
              id: p.id,
              title: 'New playlist on NellMusic',
              body: `${p.title} • ${p.owner}`,
              image: p.thumbnail,
              url: `/playlist/${p.id}`,
            });
          });
        }
      })
    );
    unsubFns.push(subscribeSadSongs((sadSongs) => set({ sadSongs })));
    unsubFns.push(subscribeRecommended((recommended) => set({ recommended })));
  },
}));

export const getCurrentApiKey = () => {
  const fromStore = useSettingsStore.getState().settings.ytApiKey;
  if (fromStore) return fromStore;
  return import.meta.env.VITE_YOUTUBE_API_KEY || '';
};
