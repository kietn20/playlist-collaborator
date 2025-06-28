// File: src/components/features/room/CurrentlyPlaying.tsx
// Purpose: Displays the details/image of the currently playing song.
// Location: src/components/features/room/

import React, { useEffect, useRef, useState, useCallback } from 'react';
import YouTube, { YouTubePlayer, YouTubeProps } from 'react-youtube';
import { PlaylistSongDto, PlaybackStateDto, PlaybackEventType } from '@/types/dtos';
import SeekBar from './SeekBar';
import PlayPauseButton from './PlayPauseButton';
// import toast from 'react-hot-toast';

interface CurrentlyPlayingProps {
    currentSong: PlaylistSongDto | null;
    isLeader: boolean;
    onSongEnded: (songId: string | null) => void;
    onSendPlaybackState: (state: Omit<PlaybackStateDto, 'triggeredBy'>) => void;
    externalPlaybackState: PlaybackStateDto | null;
}

const SYNC_INTERVAL_MS = 3000; // Send a sync update every 3 seconds
const SYNC_THRESHOLD_S = 2.0; // Force sync if follower is off by more than 2 seconds


const CurrentlyPlaying: React.FC<CurrentlyPlayingProps> = ({
    currentSong, isLeader, onSongEnded, onSendPlaybackState, externalPlaybackState
}) => {
    const playerRef = useRef<YouTubePlayer | null>(null);
    const [isPlayerReady, setIsPlayerReady] = useState(false);

    // --- Local state for player (primarily for Leader's UI) ---
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    // Interval reference for periodic syncs and time updates
    const syncIntervalRef = useRef<number | null>(null);
    const timeUpdateIntervalRef = useRef<number | null>(null);

    // Function to clear intervals to prevent memory leaks
    const clearIntervals = () => {
        if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
        if (timeUpdateIntervalRef.current) clearInterval(timeUpdateIntervalRef.current);
    };

    const handlePlayerReady: YouTubeProps['onReady'] = (event) => {
        playerRef.current = event.target;
        setIsPlayerReady(true);
    };

    const handlePlayerStateChange: YouTubeProps['onStateChange'] = async (event) => {
        const player = event.target;
        const playerState = await player.getPlayerState();
        setIsPlaying(playerState === YouTube.PlayerState.PLAYING);
        setDuration(await player.getDuration());

        if (playerState === YouTube.PlayerState.ENDED) {
            onSongEnded(currentSong?.id || null);
        }

        // --- Leader Logic: Broadcast state changes on key events ---
        if (isLeader) {
            let eventType: PlaybackEventType | null = null;
            if (playerState === YouTube.PlayerState.PLAYING) eventType = 'play';
            if (playerState === YouTube.PlayerState.PAUSED) eventType = 'pause';

            if (eventType && currentSong?.youtubeVideoId) {
                onSendPlaybackState({
                    eventType: eventType,
                    isPlaying: playerState === YouTube.PlayerState.PLAYING,
                    currentTime: await player.getCurrentTime(),
                    videoId: currentSong.youtubeVideoId,
                });
            }
        }
    };

    // --- Leader Logic: Custom Controls Handlers ---
    const handleTogglePlay = useCallback(async () => {
        if (!playerRef.current) return;
        const playerState = await playerRef.current.getPlayerState();
        if (playerState === YouTube.PlayerState.PLAYING) {
            playerRef.current.pauseVideo();
        } else {
            playerRef.current.playVideo();
        }
    }, []);

    const handleSeek = useCallback((newTime: number) => {
        if (!playerRef.current || !currentSong?.youtubeVideoId) return;
        playerRef.current.seekTo(newTime, true);
        setCurrentTime(newTime); // Update UI immediately
        // Broadcast seek event
        onSendPlaybackState({
            eventType: 'seek',
            isPlaying: true, // Assume play after seek
            currentTime: newTime,
            videoId: currentSong.youtubeVideoId,
        });
    }, [currentSong, onSendPlaybackState]);

    // --- Leader Logic: Periodic Syncing ---
    useEffect(() => {
        clearIntervals(); // Clear old intervals on re-render

        if (isLeader && isPlayerReady && playerRef.current && isPlaying && currentSong?.youtubeVideoId) {
            const videoId = currentSong.youtubeVideoId;
            // Update local time display
            timeUpdateIntervalRef.current = window.setInterval(async () => {
                const currentTime = await (playerRef.current?.getCurrentTime() || Promise.resolve(0));
                setCurrentTime(currentTime);
            }, 500);

            // Send sync message periodically
            syncIntervalRef.current = window.setInterval(async () => {
                const currentTime = await (playerRef.current?.getCurrentTime() || Promise.resolve(0));
                onSendPlaybackState({
                    eventType: 'sync',
                    isPlaying: true,
                    currentTime: currentTime,
                    videoId: videoId,
                });
            }, SYNC_INTERVAL_MS);
        }

        return clearIntervals; // Cleanup on unmount or dependency change
    }, [isLeader, isPlayerReady, isPlaying, currentSong, onSendPlaybackState]);
    // --- Follower Logic: React to External State ---
    useEffect(() => {
        const syncFollowerState = async () => {
            if (!isLeader && playerRef.current && externalPlaybackState && currentSong?.youtubeVideoId === externalPlaybackState.videoId) {
                const player = playerRef.current;
                const localTime = await player.getCurrentTime();
                const remoteTime = externalPlaybackState.currentTime;
                const timeDiff = Math.abs(localTime - remoteTime);

                // Correct play/pause state
                const playerState = await player.getPlayerState();
                if (externalPlaybackState.isPlaying && playerState !== YouTube.PlayerState.PLAYING) {
                    console.log('[Follower] Correcting state to PLAY');
                    player.playVideo();
                } else if (!externalPlaybackState.isPlaying && playerState === YouTube.PlayerState.PLAYING) {
                    console.log('[Follower] Correcting state to PAUSE');
                    player.pauseVideo();
                }

                // Correct time if drifted too far
                if (timeDiff > SYNC_THRESHOLD_S) {
                    console.log(`[Follower] Resyncing time. Local: ${localTime.toFixed(2)}, Remote: ${remoteTime.toFixed(2)}, Diff: ${timeDiff.toFixed(2)}`);
                    player.seekTo(remoteTime, true);
                }
            }
        };

        syncFollowerState();
    }, [externalPlaybackState, isLeader, currentSong]);


    // Effect to handle loading new song
    useEffect(() => {
        if (isPlayerReady && playerRef.current && currentSong?.youtubeVideoId) {
            playerRef.current.loadVideoById(currentSong.youtubeVideoId);
        } else if (!currentSong && playerRef.current && typeof playerRef.current.stopVideo === 'function') {
            playerRef.current.stopVideo();
        }
    }, [currentSong, isPlayerReady]);

    const playerOpts: YouTubeProps['opts'] = {
        height: '100%',
        width: '100%',
        playerVars: {
            autoplay: isLeader ? 1 : 0, // Only leader autoplays, followers wait for state message
            controls: isLeader ? 1 : 0, // Only leader sees controls
            modestbranding: 1,
            rel: 0,
        },
    };

    return (
        <div className="p-1 rounded bg-muted/30 h-full flex flex-col items-center justify-center text-center">
            {currentSong && currentSong.youtubeVideoId ? (
                <>
                    <div className="aspect-video w-full max-h-[75vh]">
                        <YouTube
                            videoId={currentSong.youtubeVideoId}
                            opts={playerOpts}
                            onReady={handlePlayerReady}
                            onStateChange={handlePlayerStateChange}
                            className="w-full h-full rounded-md overflow-hidden shadow-lg"
                        />
                    </div>
                    <div className="mt-4 px-2 w-full flex flex-col items-center gap-2">
                        <h3 className="text-xl font-bold text-primary truncate" title={currentSong.title}>{currentSong.title}</h3>
                        <p className="text-md text-secondary truncate" title={currentSong.artist}>{currentSong.artist}</p>
                        {/* Leader gets custom controls */}
                        {isLeader && isPlayerReady && (
                            <div className="w-full max-w-md flex flex-col items-center gap-2 mt-2">
                                <PlayPauseButton isPlaying={isPlaying} onTogglePlay={handleTogglePlay} />
                                <SeekBar
                                    currentTime={currentTime}
                                    duration={duration}
                                    onSeek={handleSeek}
                                    disabled={!isPlayerReady}
                                />
                            </div>
                        )}
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