const SEEN_KEY = 'nellmusic_notif_seen_ids';
const PERM_ASKED = 'nellmusic_notif_perm_asked';

let swReg: ServiceWorkerRegistration | null = null;

export const registerSW = async () => {
  if (!('serviceWorker' in navigator)) return null;
  try {
    swReg = await navigator.serviceWorker.register('/sw.js');
    return swReg;
  } catch (e) {
    console.warn('SW register failed', e);
    return null;
  }
};

export const ensureNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!('Notification' in window)) return 'denied';
  if (Notification.permission === 'default' && !sessionStorage.getItem(PERM_ASKED)) {
    sessionStorage.setItem(PERM_ASKED, '1');
    try { return await Notification.requestPermission(); } catch { return Notification.permission; }
  }
  return Notification.permission;
};

const loadSeen = (): Set<string> => {
  try { return new Set(JSON.parse(localStorage.getItem(SEEN_KEY) || '[]')); }
  catch { return new Set(); }
};
const saveSeen = (s: Set<string>) =>
  localStorage.setItem(SEEN_KEY, JSON.stringify([...s].slice(-200)));

export interface NotifyPayload {
  id: string;
  title: string;
  body?: string;
  image?: string;
  url?: string;
}

export const notifyNewItem = async (p: NotifyPayload) => {
  const seen = loadSeen();
  if (seen.has(p.id)) return;
  seen.add(p.id);
  saveSeen(seen);

  const perm = await ensureNotificationPermission();
  if (perm !== 'granted') return;

  const reg = swReg || (await navigator.serviceWorker.getRegistration());
  if (reg && reg.active) {
    reg.active.postMessage({
      type: 'NOTIFY',
      title: p.title,
      body: p.body || '',
      image: p.image,
      icon: p.image,
      url: p.url || '/',
      tag: p.id,
    });
  } else if ('Notification' in window) {
    new Notification(p.title, { body: p.body, icon: p.image });
  }
};

export const seedSeen = (ids: string[]) => {
  if (loadSeen().size === 0) saveSeen(new Set(ids));
};
