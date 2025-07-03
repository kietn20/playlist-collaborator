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

    // State for the Leader's UI controls ONLY
    const [leaderDisplayTime, setLeaderDisplayTime] = useState(0);
    const [leaderDuration, setLeaderDuration] = useState(0);
    const [isLeaderPlaying, setIsLeaderPlaying] = useState(false);

    // This ref helps prevent a sync message from causing a seek right after the leader seeks manually
    const justSeekedRef = useRef(false);

    // --- Player Event Handlers ---

    const handlePlayerReady: YouTubeProps['onReady'] = (event) => {
        playerRef.current = event.target;
        setIsPlayerReady(true);
    };

    const handlePlayerStateChange: YouTubeProps['onStateChange'] = (event) => {
        const player = playerRef.current;
        if (!player || !isLeader) return;

        const playerState = player.getPlayerState();
        const isPlaying = playerState === YouTube.PlayerState.PLAYING;
        setIsLeaderPlaying(isPlaying);
        setLeaderDuration(player.getDuration());

        if (playerState === YouTube.PlayerState.ENDED) {
            onSongEnded(currentSong?.id || null);
            return;
        }

        let eventType: PlaybackEventType | null = null;
        if (playerState === YouTube.PlayerState.PLAYING) eventType = 'play';
        if (playerState === YouTube.PlayerState.PAUSED) eventType = 'pause';
        
        if (eventType && currentSong?.youtubeVideoId) {
            onSendPlaybackState({
                eventType,
                isPlaying,
                currentTime: player.getCurrentTime(),
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

    const handleTogglePlay = useCallback(() => {
        const player = playerRef.current;
        if (!player) return;
        const playerState = player.getPlayerState();
        (playerState === YouTube.PlayerState.PLAYING) ? player.pauseVideo() : player.playVideo();
    }, []);

    const handleSeek = useCallback((newTime: number) => {
        const player = playerRef.current;
        if (!player || !currentSong?.youtubeVideoId) return;
        player.seekTo(newTime, true);
        setLeaderDisplayTime(newTime);
        justSeekedRef.current = true; // Mark that we just manually sought
        onSendPlaybackState({ eventType: 'seek', isPlaying: isLeaderPlaying, currentTime: newTime, videoId: currentSong.youtubeVideoId });
        setTimeout(() => { justSeekedRef.current = false; }, 1000); // Reset the flag after 1s
    }, [currentSong, isLeaderPlaying, onSendPlaybackState]);

    // --- Main `useEffect` for all player synchronization and control ---
    useEffect(() => {
        const player = playerRef.current;

        // If the player isn't ready for this render, we can't do anything yet.
        if (!isPlayerReady || !player) {
            return;
        }

        // LEADER LOGIC: Controls intervals and UI updates
        if (isLeader) {
            const timeIntervalId = window.setInterval(() => {
                const current = player.getCurrentTime();
                if (current) setLeaderDisplayTime(current);
            }, 500);

            let syncIntervalId: number | null = null;
            if (isLeaderPlaying) {
                syncIntervalId = window.setInterval(() => {
                    const videoId = currentSong?.youtubeVideoId;
                    if (player && videoId) {
                        onSendPlaybackState({ eventType: 'sync', isPlaying: true, currentTime: player.getCurrentTime(), videoId });
                    }
                }, SYNC_INTERVAL_MS);
            }
            // Cleanup function for Leader intervals
            return () => {
                clearInterval(timeIntervalId);
                if (syncIntervalId) clearInterval(syncIntervalId);
            };
        }

        // FOLLOWER LOGIC: Reacts to external state changes
        else {
            if (externalPlaybackState && currentSong?.youtubeVideoId === externalPlaybackState.videoId) {
                const playerState = player.getPlayerState();
                const remote = externalPlaybackState;

                // Don't sync if leader just sought, gives time for player to catch up
                if (remote.eventType === 'sync' && justSeekedRef.current) return;

                // Sync Play/Pause State
                if (remote.isPlaying && playerState !== YouTube.PlayerState.PLAYING) {
                    player.playVideo();
                } else if (!remote.isPlaying && playerState === YouTube.PlayerState.PLAYING) {
                    player.pauseVideo();
                }

                // Sync Time (Seek)
                const localTime = player.getCurrentTime();
                const timeDiff = Math.abs(localTime - remote.currentTime);
                if (timeDiff > SYNC_THRESHOLD_S) {
                    player.seekTo(remote.currentTime, true);
                }
            }
        }

    }, [isLeader, currentSong, isPlayerReady, isLeaderPlaying, externalPlaybackState, onSendPlaybackState]);

    const playerOpts: YouTubeProps['opts'] = {
        height: '100%', width: '100%',
        playerVars: {
            autoplay: isLeader ? 1 : 0,
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