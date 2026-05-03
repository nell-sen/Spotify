export interface Track {
  id: string; // YouTube videoId
  title: string;
  artist: string; // channel name
  thumbnail: string;
  duration: number; // seconds
  durationFormatted: string;
  addedAt: number;
}

export interface Playlist {
  id: string;
  title: string;
  description?: string;
  thumbnail: string;
  owner: string;
  tracks: Track[];
  trackCount: number;
  importedAt: number;
  youtubePlaylistId?: string;
}

export interface SearchResult {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  type: 'track' | 'playlist' | 'channel';
  duration?: number;
  durationFormatted?: string;
}
