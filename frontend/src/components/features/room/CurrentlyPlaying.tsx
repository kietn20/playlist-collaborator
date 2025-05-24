// File: src/components/features/room/CurrentlyPlaying.tsx
// Purpose: Displays the details/image of the currently playing song.
// Location: src/components/features/room/

import React, { useEffect, useRef } from 'react';
import YouTube, { YouTubePlayer, YouTubeProps } from 'react-youtube'; // Import YouTube
import { PlaylistSongDto } from '@/types/dtos';
import toast from 'react-hot-toast';

interface CurrentlyPlayingProps {
    currentSong: PlaylistSongDto | null;
    onSongEnded: (songId: string | null) => void;
}

const CurrentlyPlaying: React.FC<CurrentlyPlayingProps> = ({ currentSong, onSongEnded }) => {
    const playerRef = useRef<YouTubePlayer | null>(null);


    const onPlayerReady: YouTubeProps['onReady'] = (event) => {
        playerRef.current = event.target; // Store the player instance
        console.log("Player ready:", event.target, "playing:", currentSong?.title);
    };

    const onPlayerStateChange: YouTubeProps['onStateChange'] = (event) => {
        console.log("Player state change. Data:", event.data, "Song:", currentSong?.title);
        if (event.data === YouTube.PlayerState.ENDED) { // YT.PlayerState.ENDED is 0
            console.log("Song ended:", currentSong?.title, "ID:", currentSong?.id);
            if (currentSong && currentSong.id) {
                onSongEnded(currentSong.id);
            } else {
                onSongEnded(null); // Should not happen if a song was playing
            }
        }
    };

    // Effect to handle changes in currentSong prop to load new video
    useEffect(() => {
        if (currentSong && currentSong.youtubeVideoId && playerRef.current) {
            console.log("New currentSong, attempting to load videoId:", currentSong.youtubeVideoId);
            // Check if player's current video is different to avoid unnecessary reloads/flicker
            // This check is a bit complex because player API might not expose current videoId directly
            // easily without an API call, so direct load is often fine.
            // For now, we'll just load it. Autoplay will handle if it should play.
            playerRef.current.loadVideoById(currentSong.youtubeVideoId);
        } else if (!currentSong && playerRef.current && typeof playerRef.current.stopVideo === 'function') {
            // If no current song, stop the player
            playerRef.current.stopVideo();
        }
    }, [currentSong]); // Rerun when currentSong changes

    const handlePlayerError: YouTubeProps['onError'] = (event) => {
        console.error("YouTube Player Error. Event Data:", event.data, "Song:", currentSong);
        let errorMessage = "The video could not be played.";
        switch (event.data) {
            case 2: errorMessage = "Invalid video ID or request."; break;
            case 5: errorMessage = "Video cannot be played in HTML5 player."; break;
            case 100: errorMessage = "Video not found."; break;
            case 101:
            case 150: errorMessage = "Video owner does not allow embedded playback."; break;
        }
        toast.error(errorMessage);

        // Automatically skip to the next song if there's an error with the current one
        if (currentSong && currentSong.id) {
            onSongEnded(currentSong.id); // Treat it as if the song ended
        } else {
            onSongEnded(null); // Should ideally not happen if an error occurs on a loaded song
        }
    };

    const playerOpts: YouTubeProps['opts'] = {
        height: '100%', // Make responsive
        width: '100%',  // Make responsive
        playerVars: {
            autoplay: 1, // Auto-play when loaded (for current song)
            controls: 1, // Show default YouTube controls
            modestbranding: 1, // Reduce YouTube logo
            rel: 0, // Do not show related videos at the end
        },
    };

    return (
        <div className="p-1 rounded bg-muted/30 h-full flex flex-col items-center justify-center text-center aspect-video max-h-[75vh]">
            {currentSong && currentSong.youtubeVideoId ? (
                <>
                    <YouTube
                        videoId={currentSong.youtubeVideoId} // Initial videoId
                        opts={playerOpts}
                        onReady={onPlayerReady}
                        onStateChange={onPlayerStateChange}
                        className="w-full h-full rounded-md overflow-hidden shadow-lg"
                        onError={handlePlayerError}
                    />
                    <div className="mt-2 px-2 w-full text-left"> {/* Ensure text can wrap */}
                        <h3 className="text-lg font-semibold text-primary truncate" title={currentSong.title}>{currentSong.title}</h3>
                        <p className="text-sm text-secondary truncate" title={currentSong.artist}>{currentSong.artist}</p>
                    </div>
                </>
            ) : (
                <div className="w-full h-full bg-muted rounded-md flex items-center justify-center">
                    <p className="text-muted-foreground">No song currently playing or queue is empty.</p>
                </div>
            )}
        </div>
    );
};
export default CurrentlyPlaying;