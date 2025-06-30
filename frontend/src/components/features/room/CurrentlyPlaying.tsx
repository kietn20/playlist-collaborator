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
    
    const [leaderCurrentTime, setLeaderCurrentTime] = useState(0);
    const [leaderDuration, setLeaderDuration] = useState(0);
    const [isLeaderPlaying, setIsLeaderPlaying] = useState(false);

    const syncIntervalRef = useRef<number | null>(null);
    const timeUpdateIntervalRef = useRef<number | null>(null);

    const clearIntervals = useCallback(() => {
        if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
        if (timeUpdateIntervalRef.current) clearInterval(timeUpdateIntervalRef.current);
    }, []);

    const handlePlayerReady: YouTubeProps['onReady'] = (event) => {
        playerRef.current = event.target;
        setIsPlayerReady(true);
    };

    const handlePlayerStateChange: YouTubeProps['onStateChange'] = (event) => {
        if (!isLeader || !playerRef.current) return;

        const player = playerRef.current;
        const playerState = player.getPlayerState();
        const isPlayingNow = playerState === YouTube.PlayerState.PLAYING;
        
        setIsLeaderPlaying(isPlayingNow);
        setLeaderDuration(player.getDuration());
        
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
                eventType: eventType,
                isPlaying: isPlayingNow,
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
        if (!playerRef.current) return;
        const playerState = playerRef.current.getPlayerState();
        if (playerState === YouTube.PlayerState.PLAYING) {
            playerRef.current.pauseVideo();
        } else {
            playerRef.current.playVideo();
        }
    }, []);

    const handleSeek = useCallback((newTime: number) => {
        if (!playerRef.current || !currentSong?.youtubeVideoId) return;
        playerRef.current.seekTo(newTime, true);
        setLeaderCurrentTime(newTime);
        onSendPlaybackState({
            eventType: 'seek',
            isPlaying: true, // Assume play after seek
            currentTime: newTime,
            videoId: currentSong.youtubeVideoId,
        });
    }, [currentSong, onSendPlaybackState]);

    // LEADER: Periodic Syncing and local time updates
    useEffect(() => {
        clearIntervals();
        if (isLeader && isPlayerReady && playerRef.current && isLeaderPlaying && currentSong?.youtubeVideoId) {
            const videoId = currentSong.youtubeVideoId;
            
            timeUpdateIntervalRef.current = window.setInterval(() => {
                setLeaderCurrentTime(playerRef.current?.getCurrentTime() || 0);
            }, 500);

            syncIntervalRef.current = window.setInterval(() => {
                const player = playerRef.current;
                if (!player) return;
                onSendPlaybackState({ eventType: 'sync', isPlaying: true, currentTime: player.getCurrentTime(), videoId });
            }, SYNC_INTERVAL_MS);
        }
        return clearIntervals;
    }, [isLeader, isPlayerReady, isLeaderPlaying, currentSong, onSendPlaybackState, clearIntervals]);

    // FOLLOWER: React to External State
    useEffect(() => {
        const player = playerRef.current;
        if (isLeader || !isPlayerReady || !player || !externalPlaybackState || currentSong?.youtubeVideoId !== externalPlaybackState.videoId) {
            return;
        }
        
        const remoteState = externalPlaybackState;
        const playerState = player.getPlayerState();

        switch (remoteState.eventType) {
            case 'play':
                if (playerState !== YouTube.PlayerState.PLAYING) {
                    player.seekTo(remoteState.currentTime, true);
                    player.playVideo();
                }
                break;
            case 'pause':
                if (playerState !== YouTube.PlayerState.PAUSED) {
                    player.pauseVideo();
                }
                break;
            case 'seek':
                player.seekTo(remoteState.currentTime, true);
                if (remoteState.isPlaying && playerState !== YouTube.PlayerState.PLAYING) {
                    player.playVideo();
                } else if (!remoteState.isPlaying && playerState === YouTube.PlayerState.PLAYING) {
                    player.pauseVideo();
                }
                break;
            case 'sync':
                if (remoteState.isPlaying && playerState === YouTube.PlayerState.PLAYING) {
                    const localTime = player.getCurrentTime();
                    if (Math.abs(localTime - remoteState.currentTime) > SYNC_THRESHOLD_S) {
                        player.seekTo(remoteState.currentTime, true);
                    }
                } else if (remoteState.isPlaying && playerState !== YouTube.PlayerState.PLAYING) {
                    player.seekTo(remoteState.currentTime, true);
                    player.playVideo();
                }
                break;
        }
    }, [externalPlaybackState, isLeader, isPlayerReady, currentSong]);
    
    // This effect handles loading a new song into the player when `currentSong` changes for both Leader and Follower
    useEffect(() => {
        if (isPlayerReady && playerRef.current && currentSong?.youtubeVideoId) {
            console.log(`Loading new video for ${isLeader ? 'Leader' : 'Follower'}: ${currentSong.title}`);
            playerRef.current.loadVideoById(currentSong.youtubeVideoId);
        } else if (!currentSong && playerRef.current && typeof playerRef.current.stopVideo === 'function') {
            playerRef.current.stopVideo();
        }
    }, [currentSong, isPlayerReady, isLeader]);

    const playerOpts: YouTubeProps['opts'] = {
        height: '100%', width: '100%',
        playerVars: {
            autoplay: isLeader ? 1 : 0,
            controls: isLeader ? 1 : 0,
            modestbranding: 1, rel: 0,
            disablekb: isLeader ? 0 : 1,
        },
    };

    return (
        <div className="p-1 rounded bg-muted/30 h-full flex flex-col items-center justify-center text-center">
            {currentSong && currentSong.youtubeVideoId ? (
                <>
                    <div className="aspect-video w-full max-h-[75vh]">
                        <YouTube
                            key={currentSong.id}
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