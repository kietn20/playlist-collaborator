// File: frontend/src/components/features/room/CurrentlyPlaying.tsx (Final, Final Corrected Version)

import React, { useEffect, useRef, useState, useCallback } from 'react';
import YouTube, { YouTubePlayer, YouTubeProps } from 'react-youtube';
import { PlaylistSongDto, PlaybackStateDto, PlaybackEventType } from '@/types/dtos';
import SeekBar from './SeekBar';
import PlayPauseButton from './PlayPauseButton';
import toast from 'react-hot-toast';

interface CurrentlyPlayingProps {
    currentSong: PlaylistSongDto | null;
    isLeader: boolean;
    onSongEnded: (songId: string | null) => void;
    onSendPlaybackState: (state: Omit<PlaybackStateDto, 'triggeredBy'>) => void;
    externalPlaybackState: PlaybackStateDto | null;
}

const SYNC_INTERVAL_MS = 3000;
const SYNC_THRESHOLD_S = 1.5;

const CurrentlyPlaying: React.FC<CurrentlyPlayingProps> = ({
    currentSong, isLeader, onSongEnded, onSendPlaybackState, externalPlaybackState
}) => {
    const playerRef = useRef<YouTubePlayer | null>(null);
    const [isPlayerReady, setIsPlayerReady] = useState(false);

    const [leaderDisplayTime, setLeaderDisplayTime] = useState(0);
    // const [_, setLeaderCurrentTime] = useState(0);
    const [leaderDuration, setLeaderDuration] = useState(0);
    const [isLeaderPlaying, setIsLeaderPlaying] = useState(false);

    const justSeekedRef = useRef(false);

    const syncIntervalRef = useRef<number | null>(null);
    const timeUpdateIntervalRef = useRef<number | null>(null);

    const clearIntervals = useCallback(() => {
        if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
        if (timeUpdateIntervalRef.current) clearInterval(timeUpdateIntervalRef.current);
    }, []);

    // --- Player Event Handlers ---

    const handlePlayerReady: YouTubeProps['onReady'] = (event) => {
        playerRef.current = event.target;
        setIsPlayerReady(true);
        if (isLeader) {
            event.target.playVideo();
        }
    };

    const handlePlayerStateChange: YouTubeProps['onStateChange'] = async () => {
        const player = playerRef.current;
        if (!isLeader || !player) return;

        const playerState = await player.getPlayerState();
        const isPlayingNow = playerState === YouTube.PlayerState.PLAYING;

        setIsLeaderPlaying(isPlayingNow);
        setLeaderDuration(await player.getDuration());

        if (playerState === YouTube.PlayerState.ENDED) {
            clearIntervals();
            onSongEnded(currentSong?.id || null);
            return;
        }

        let eventType: PlaybackEventType | null = null;
        if (playerState === YouTube.PlayerState.PLAYING) eventType = 'play';
        if (playerState === YouTube.PlayerState.PAUSED) eventType = 'pause';

        if (eventType && currentSong?.youtubeVideoId) {
            onSendPlaybackState({
                eventType,
                isPlaying: isPlayingNow,
                currentTime: await player.getCurrentTime(),
                videoId: currentSong.youtubeVideoId,
            });
        }
    };

    const handlePlayerError: YouTubeProps['onError'] = (event) => {
        console.error("YouTube Player Error. Event Data:", event.data, "Song:", currentSong);
        let errorMessage = "The video could not be played.";
        switch (event.data) {
            case 2: errorMessage = "Invalid video ID or request."; break;
            case 5: errorMessage = "Video cannot be played in HTML5 player."; break;
            case 100: errorMessage = "Video not found."; break;
            case 101: case 150: errorMessage = "Video owner does not allow embedded playback."; break;
        }
        toast.error(errorMessage);
        if (isLeader && currentSong?.id) {
            onSongEnded(currentSong.id);
        }
    };

    const handleTogglePlay = useCallback(async () => {
        const player = playerRef.current;
        if (!player) return;
        const playerState = await player.getPlayerState();
        if (playerState === YouTube.PlayerState.PLAYING) {
            player.pauseVideo();
        } else {
            player.playVideo();
        }
    }, []);

    const handleSeek = useCallback((newTime: number) => {
        const player = playerRef.current;
        if (!player || !currentSong?.youtubeVideoId) return;
        player.seekTo(newTime, true);
        setLeaderDisplayTime(newTime);
        justSeekedRef.current = true;
        onSendPlaybackState({ eventType: 'seek', isPlaying: isLeaderPlaying, currentTime: newTime, videoId: currentSong.youtubeVideoId });
        setTimeout(() => { justSeekedRef.current = false; }, 1000);
    }, [currentSong, isLeaderPlaying, onSendPlaybackState]);

    useEffect(() => {
        clearIntervals();
        if (isLeader && isPlayerReady && playerRef.current && isLeaderPlaying && currentSong?.youtubeVideoId) {
            const videoId = currentSong.youtubeVideoId;
            const timeIntervalId = window.setInterval(() => {
                (async () => {
                    const currentTime = await playerRef.current?.getCurrentTime();
                    if (typeof currentTime === 'number') setLeaderDisplayTime(currentTime);
                })();
            }, 500);
            timeUpdateIntervalRef.current = timeIntervalId;

            const syncIntervalId = window.setInterval(() => {
                (async () => {
                    if (playerRef.current) {
                        const currentTime = await playerRef.current.getCurrentTime();
                        onSendPlaybackState({ eventType: 'sync', isPlaying: true, currentTime, videoId });
                    }
                })();
            }, SYNC_INTERVAL_MS);
            syncIntervalRef.current = syncIntervalId;
        }
        return clearIntervals;
    }, [isLeader, isPlayerReady, isLeaderPlaying, currentSong, onSendPlaybackState, clearIntervals]);

    useEffect(() => {
        const player = playerRef.current;
        if (isLeader || !isPlayerReady || !player || !externalPlaybackState || currentSong?.youtubeVideoId !== externalPlaybackState.videoId) {
            return;
        }

        const syncFollowerPlayer = async () => {
            const remoteState = externalPlaybackState;
            const playerState = await player.getPlayerState();

            // A 'sync' event while the follower is paused/cued should behave like a 'play' event
            // This is key for the initial start-up synchronization
            const effectiveEventType = (remoteState.eventType === 'sync' && playerState !== YouTube.PlayerState.PLAYING)
                ? 'play'
                : remoteState.eventType;

            switch (effectiveEventType) {
                case 'play':
                    if (playerState !== YouTube.PlayerState.PLAYING) {
                        console.log(`[Follower] Syncing to PLAY at ${remoteState.currentTime.toFixed(2)}s`);
                        player.seekTo(remoteState.currentTime, true);
                        player.playVideo();
                    }
                    break;
                case 'pause':
                    if (playerState !== YouTube.PlayerState.PAUSED) {
                        console.log('[Follower] Syncing to PAUSE');
                        player.pauseVideo();
                    }
                    break;
                case 'seek':
                    console.log(`[Follower] Syncing to SEEK at ${remoteState.currentTime.toFixed(2)}s`);
                    player.seekTo(remoteState.currentTime, true);
                    if (remoteState.isPlaying && playerState !== YouTube.PlayerState.PLAYING) {
                        player.playVideo();
                    }
                    break;
                case 'sync':
                    // This now only handles drift correction for an already playing video
                    if (playerState === YouTube.PlayerState.PLAYING) {
                        const localTime = await player.getCurrentTime();
                        const timeDiff = Math.abs(localTime - remoteState.currentTime);
                        if (timeDiff > SYNC_THRESHOLD_S) {
                            console.log(`[Follower] Correcting drift. Diff: ${timeDiff.toFixed(2)}s`);
                            player.seekTo(remoteState.currentTime, true);
                        }
                    }
                    break;
            }
        };

        syncFollowerPlayer();
    }, [externalPlaybackState, isLeader, isPlayerReady, currentSong]);

    // Main useEffect for handling song changes and cleanup
    useEffect(() => {
        if (!currentSong) {
            // Cleanup logic when queue is empty
            if (playerRef.current && typeof playerRef.current.stopVideo === 'function') {
                playerRef.current.stopVideo();
            }
            clearIntervals();
            setIsPlayerReady(false);
            setLeaderDuration(0);
            setLeaderDisplayTime(0);
            setIsLeaderPlaying(false);
            playerRef.current = null;
        }
    }, [currentSong, clearIntervals]);

    const playerOpts: YouTubeProps['opts'] = {
        height: '100%', width: '100%',
        playerVars: {
            // Important: Let the Leader autoplay via onReady, and the Follower start programmatically.
            autoplay: 0,
            controls: isLeader ? 1 : 0,
            modestbranding: 1, rel: 0,
            disablekb: isLeader ? 0 : 1,
        },
    };

    if (!currentSong || !currentSong.youtubeVideoId) {
        return (
            <div className="w-full h-full bg-muted rounded-md flex items-center justify-center">
                <p className="text-muted-foreground">No song currently playing or queue is empty.</p>
            </div>
        );
    }

    return (
        <div className="p-1 rounded bg-muted/30 h-full flex flex-col items-center justify-center text-center">
            <div className="aspect-video w-full max-h-[75vh]">
                <YouTube
                    key={currentSong.id} // Re-mounts the component on song change, which is key!
                    videoId={currentSong.youtubeVideoId}
                    opts={playerOpts}
                    onReady={handlePlayerReady}
                    onStateChange={handlePlayerStateChange}
                    onError={handlePlayerError}
                    className="w-full h-full rounded-md overflow-hidden shadow-lg"
                />
            </div>
            <div className="mt-4 px-2 w-full flex flex-col items-center gap-2">
                <h3 className="text-xl font-bold text-primary truncate" title={currentSong.title}>{currentSong.title}</h3>
                <p className="text-md text-secondary truncate" title={currentSong.artist}>{currentSong.artist}</p>
                {isLeader && isPlayerReady && (
                    <div className="w-full max-w-md flex flex-col items-center gap-2 mt-2">
                        <PlayPauseButton isPlaying={isLeaderPlaying} onTogglePlay={handleTogglePlay} disabled={!isPlayerReady} />
                        <SeekBar currentTime={leaderDisplayTime} duration={leaderDuration} onSeek={handleSeek} disabled={!isPlayerReady} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default CurrentlyPlaying;