import { useYouTubePlayer } from '@/hooks/useYouTubePlayer';

const PLAYER_ID = 'yt-hidden-player';

export const YouTubePlayer = () => {
  useYouTubePlayer(PLAYER_ID);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: -9999,
        left: -9999,
        width: 1,
        height: 1,
        opacity: 0,
        pointerEvents: 'none',
        zIndex: -1,
      }}
    >
      <div id={PLAYER_ID} />
    </div>
  );
};
