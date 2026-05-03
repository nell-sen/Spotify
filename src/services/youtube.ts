import axios from 'axios';
import { Playlist, SearchResult, Track } from '../types';

const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

export const normalizeDuration = (iso8601: string): number => {
  const match = iso8601.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);
  return hours * 3600 + minutes * 60 + seconds;
};

export const formatDuration = (seconds: number): string => {
  if (!seconds) return '0:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export const extractVideoId = (url: string): string | null => {
  const patterns = [
    /(?:youtu\.be\/)([^?&\s]{11})/,
    /(?:youtube\.com\/watch\?v=)([^&\s]{11})/,
    /(?:youtube\.com\/embed\/)([^?&\s]{11})/,
    /(?:youtube\.com\/v\/)([^?&\s]{11})/,
    /(?:youtube\.com\/shorts\/)([^?&\s]{11})/,
    /(?:music\.youtube\.com\/watch\?v=)([^&\s]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url;
  return null;
};

export const extractPlaylistId = (url: string): string | null => {
  const match = url.match(/[?&]list=([^&\s]+)/);
  return match ? match[1] : null;
};

export const fetchVideo = async (videoId: string): Promise<Track> => {
  if (!API_KEY) throw new Error('YouTube API Key missing');
  const res = await axios.get(`${BASE_URL}/videos`, {
    params: { part: 'snippet,contentDetails', id: videoId, key: API_KEY },
  });
  const item = res.data.items[0];
  if (!item) throw new Error('Video not found');
  const duration = normalizeDuration(item.contentDetails.duration);
  return {
    id: item.id,
    title: item.snippet.title,
    artist: item.snippet.channelTitle,
    thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url || '',
    duration,
    durationFormatted: formatDuration(duration),
    addedAt: Date.now(),
  };
};

export const fetchPlaylistInfo = async (playlistId: string) => {
  if (!API_KEY) throw new Error('YouTube API Key missing');
  const res = await axios.get(`${BASE_URL}/playlists`, {
    params: { part: 'snippet,contentDetails', id: playlistId, key: API_KEY },
  });
  return res.data.items[0];
};

export const fetchPlaylist = async (playlistId: string): Promise<Playlist> => {
  if (!API_KEY) throw new Error('YouTube API Key missing');

  const infoRes = await fetchPlaylistInfo(playlistId);
  const tracks: Track[] = [];
  let nextPageToken: string | undefined = undefined;

  do {
    const itemsRes: any = await axios.get(`${BASE_URL}/playlistItems`, {
      params: {
        part: 'snippet,contentDetails',
        playlistId,
        maxResults: 50,
        pageToken: nextPageToken,
        key: API_KEY,
      },
    });

    const videoIds = itemsRes.data.items
      .map((i: any) => i.contentDetails.videoId)
      .filter(Boolean)
      .join(',');

    if (videoIds) {
      const videoRes = await axios.get(`${BASE_URL}/videos`, {
        params: { part: 'snippet,contentDetails', id: videoIds, key: API_KEY },
      });

      const videoMap: Record<string, any> = {};
      videoRes.data.items.forEach((v: any) => { videoMap[v.id] = v; });

      for (const item of itemsRes.data.items) {
        const vid = videoMap[item.contentDetails.videoId];
        if (!vid) continue;
        const duration = normalizeDuration(vid.contentDetails.duration);
        tracks.push({
          id: vid.id,
          title: vid.snippet.title,
          artist: vid.snippet.channelTitle,
          thumbnail: vid.snippet.thumbnails?.high?.url || vid.snippet.thumbnails?.default?.url || '',
          duration,
          durationFormatted: formatDuration(duration),
          addedAt: Date.now(),
        });
      }
    }

    nextPageToken = itemsRes.data.nextPageToken;
  } while (nextPageToken && tracks.length < 500);

  const info = infoRes?.snippet;
  return {
    id: playlistId,
    title: info?.title || 'Untitled Playlist',
    description: info?.description,
    thumbnail: info?.thumbnails?.high?.url || info?.thumbnails?.default?.url || '',
    owner: info?.channelTitle || 'Unknown',
    tracks,
    trackCount: tracks.length,
    importedAt: Date.now(),
    youtubePlaylistId: playlistId,
  };
};

export const searchYouTube = async (query: string, type = 'video,playlist'): Promise<SearchResult[]> => {
  if (!API_KEY) throw new Error('YouTube API Key missing');
  const res = await axios.get(`${BASE_URL}/search`, {
    params: { part: 'snippet', q: query, type, maxResults: 20, key: API_KEY },
  });

  const results: SearchResult[] = [];
  for (const item of res.data.items) {
    const isVideo = !!item.id.videoId;
    const result: SearchResult = {
      id: item.id.videoId || item.id.playlistId,
      title: item.snippet.title,
      artist: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url || '',
      type: isVideo ? 'track' : 'playlist',
    };

    if (isVideo) {
      try {
        const vRes = await axios.get(`${BASE_URL}/videos`, {
          params: { part: 'contentDetails', id: item.id.videoId, key: API_KEY },
        });
        const d = normalizeDuration(vRes.data.items[0]?.contentDetails?.duration || 'PT0S');
        result.duration = d;
        result.durationFormatted = formatDuration(d);
      } catch {}
    }

    results.push(result);
  }
  return results;
};

export const TRENDING_PLAYLISTS = [
  { id: 'PLrEnWoR732-BHrPp_Pm8_VleD68f9s14-N', title: 'Top Hits 2024', thumbnail: 'https://i.ytimg.com/vi/JGwWNGJdvx8/hqdefault.jpg' },
  { id: 'PLDIoUOhQQPlXr63I_vwF06Dq4p7FMrOHn', title: 'Chill Vibes', thumbnail: 'https://i.ytimg.com/vi/5qap5aO4i9A/hqdefault.jpg' },
  { id: 'PLw-VjHDlEOgs658kAHR_LAaILBXb-s6Q5', title: 'Lo-Fi Hip Hop', thumbnail: 'https://i.ytimg.com/vi/jfKfPfyJRdk/hqdefault.jpg' },
  { id: 'PL4o29bINVT4EG_y-k5jGoOu3-Am8Nyo10', title: 'EDM Bangers', thumbnail: 'https://i.ytimg.com/vi/iLkDM6XMYxM/hqdefault.jpg' },
  { id: 'PLhd1HyMTk3f4Qm8MRSEBfYDMvNnFp2bRa', title: 'Indie Pop', thumbnail: 'https://i.ytimg.com/vi/M7lc1UVf-VE/hqdefault.jpg' },
  { id: 'PLyORnIW1xT6waE-AMUq-R_QFEmLVjFf_X', title: 'Phonk Music', thumbnail: 'https://i.ytimg.com/vi/lkm_j0jEJts/hqdefault.jpg' },
];
