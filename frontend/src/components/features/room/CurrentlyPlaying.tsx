// File: src/components/features/room/CurrentlyPlaying.tsx
// Purpose: Displays the details/image of the currently playing song.
// Location: src/components/features/room/

import React from 'react';
import YouTube, { YouTubeProps } from 'react-youtube'; // Import YouTube
import { PlaylistSongDto } from '@/types/dtos';

interface CurrentlyPlayingProps {
    currentSong: PlaylistSongDto | null;
}

const CurrentlyPlaying: React.FC<CurrentlyPlayingProps> = ({ currentSong }) => {
    const onPlayerReady: YouTubeProps['onReady'] = (event) => {
        // Access to player in event.target
        // event.target.pauseVideo(); // Example: auto-pause
        console.log("Player ready:", event.target);
    };

    const onPlayerStateChange: YouTubeProps['onStateChange'] = (event) => {
        // event.data has player state (playing, paused, ended, etc.)
        console.log("Player state change:", event.data, event.target.getPlayerState());
    };

    const playerOpts: YouTubeProps['opts'] = {
        height: '100%', // Make responsive
        width: '100%',  // Make responsive
        playerVars: {
            // https://developers.google.com/youtube/player_parameters
            autoplay: 1, // Auto-play when loaded (for current song)
            controls: 1, // Show default YouTube controls
            modestbranding: 1, // Reduce YouTube logo
            rel: 0, // Do not show related videos at the end
        },
    };

    return (
        <div className="p-1 rounded bg-muted/30 h-full flex flex-col items-center justify-center text-center aspect-video max-h-[75vh]"> {/* Aspect ratio container for video */}
            {currentSong && currentSong.youtubeVideoId ? (
                <YouTube
                    videoId={currentSong.youtubeVideoId}
                    opts={playerOpts}
                    onReady={onPlayerReady}
                    onStateChange={onPlayerStateChange}
                    className="w-full h-full rounded-md overflow-hidden shadow-lg" // Ensure it fills its container
                    onError={(e) => console.error("YouTube Player Error:", e)}
                />
                // You might still want to display title/artist below the player if controls are minimal
                // <div className="mt-2">
                //    <h3 className="text-lg font-semibold text-primary">{currentSong.title}</h3>
                //    <p className="text-sm text-secondary">{currentSong.artist}</p>
                // </div>
            ) : (
                <div className="w-full h-full bg-muted rounded-md flex items-center justify-center">
                    <p className="text-muted-foreground">No song currently playing or queue is empty.</p>
                </div>
            )}
        </div>
    );
};
export default CurrentlyPlaying;