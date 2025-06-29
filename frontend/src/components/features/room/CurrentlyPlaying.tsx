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

    // --- Leader's LOCAL UI state ---
    const [leaderCurrentTime, setLeaderCurrentTime] = useState(0);
    const [leaderDuration, setLeaderDuration] = useState(0);
    const [isLeaderPlaying, setIsLeaderPlaying] = useState(false);

    // --- Local state for player (primarily for Leader's UI) ---
    // const [isPlaying, setIsPlaying] = useState(false);
    const [, setCurrentTime] = useState(0);
    // const [duration, setDuration] = useState(0);

    // Interval reference for periodic syncs and time updates
    const syncIntervalRef = useRef<number | null>(null);
    // const timeUpdateIntervalRef = useRef<number | null>(null);

    // // Function to clear intervals to prevent memory leaks
    // const clearIntervals = () => {
    //     if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
    //     if (timeUpdateIntervalRef.current) clearInterval(timeUpdateIntervalRef.current);
    // };

    const clearIntervals = () => {
        if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
    };

    const handlePlayerReady: YouTubeProps['onReady'] = (event) => {
        playerRef.current = event.target;
        setIsPlayerReady(true);
    };

    const handlePlayerStateChange: YouTubeProps['onStateChange'] = async (event) => {
        // This handler is now PRIMARILY for the LEADER to broadcast its state
        if (!isLeader) return;

        const player = event.target;
        const playerState = await player.getPlayerState();
        const isPlayingNow = playerState === YouTube.PlayerState.PLAYING;

        setIsLeaderPlaying(isPlayingNow);
        setLeaderDuration(await player.getDuration());
        setLeaderCurrentTime(await player.getCurrentTime());

        if (playerState === YouTube.PlayerState.ENDED) {
            onSongEnded(currentSong?.id || null); // Leader is responsible for signaling song end
            return; // Stop further state broadcast for the ended song
        }

        let eventType: PlaybackEventType | null = null;
        if (playerState === YouTube.PlayerState.PLAYING) eventType = 'play';
        if (playerState === YouTube.PlayerState.PAUSED) eventType = 'pause';

        if (eventType && currentSong?.youtubeVideoId) {
            onSendPlaybackState({
                eventType: eventType,
                isPlaying: isPlayingNow,
                currentTime: await player.getCurrentTime(),
                videoId: currentSong.youtubeVideoId,
            });
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
        clearIntervals();
        if (isLeader && isPlayerReady && playerRef.current && isLeaderPlaying && currentSong?.youtubeVideoId) {
            const videoId = currentSong.youtubeVideoId;
            syncIntervalRef.current = window.setInterval(async () => {
                const currentTime = await playerRef.current?.getCurrentTime() || 0;
                setLeaderCurrentTime(currentTime); // Update leader's own seek bar
                onSendPlaybackState({
                    eventType: 'sync',
                    isPlaying: true,
                    currentTime: currentTime,
                    videoId: videoId,
                });
            }, SYNC_INTERVAL_MS);
        }
        return clearIntervals;
    }, [isLeader, isPlayerReady, isLeaderPlaying, currentSong, onSendPlaybackState]);

    // --- Follower Logic: React to External State ---
    useEffect(() => {
        // This effect ONLY runs for followers to sync their player
        if (!isLeader && playerRef.current && externalPlaybackState && currentSong?.youtubeVideoId === externalPlaybackState.videoId) {
            const syncPlayer = async () => {
                const player = playerRef.current!;
                const remoteTime = externalPlaybackState.currentTime;

                // Correct play/pause state FIRST
                const playerState = await player.getPlayerState();
                if (externalPlaybackState.isPlaying && playerState !== YouTube.PlayerState.PLAYING) {
                    console.log('[Follower] Correcting state to PLAY');
                    player.playVideo();
                } else if (!externalPlaybackState.isPlaying && playerState === YouTube.PlayerState.PLAYING) {
                    console.log('[Follower] Correcting state to PAUSE');
                    player.pauseVideo();
                }

                // Then correct time if needed, AFTER play/pause is handled
                const localTime = await player.getCurrentTime();
                const timeDiff = Math.abs(localTime - remoteTime);

                if (timeDiff > SYNC_THRESHOLD_S) {
                    console.log(`[Follower] Resyncing time. Local: ${localTime.toFixed(2)}, Remote: ${remoteTime.toFixed(2)}, Diff: ${timeDiff.toFixed(2)}`);
                    player.seekTo(remoteTime, true);
                }
            };
            
            syncPlayer();
        }
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
                                <PlayPauseButton isPlaying={isLeaderPlaying} onTogglePlay={handleTogglePlay} disabled={!isPlayerReady} />
                                <SeekBar currentTime={leaderCurrentTime} duration={leaderDuration} onSeek={handleSeek} disabled={!isPlayerReady} />
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