// File: frontend/src/components/features/room/CurrentlyPlaying.tsx (Corrected)

import React, { useEffect, useRef, useState, useCallback } from 'react';
import YouTube, { YouTubePlayer, YouTubeProps } from 'react-youtube';
import { PlaylistSongDto, PlaybackStateDto, PlaybackEventType } from '@/types/dtos';
import SeekBar from './SeekBar';
import PlayPauseButton from './PlayPauseButton';

interface CurrentlyPlayingProps {
    currentSong: PlaylistSongDto | null;
    isLeader: boolean;
    onSongEnded: (songId: string | null) => void;
    onSendPlaybackState: (state: Omit<PlaybackStateDto, 'triggeredBy'>) => void;
    externalPlaybackState: PlaybackStateDto | null;
}

const SYNC_INTERVAL_MS = 3000;
const SYNC_THRESHOLD_S = 2.0;

const CurrentlyPlaying: React.FC<CurrentlyPlayingProps> = ({
    currentSong, isLeader, onSongEnded, onSendPlaybackState, externalPlaybackState
}) => {
    const playerRef = useRef<YouTubePlayer | null>(null);
    const [isPlayerReady, setIsPlayerReady] = useState(false);

    const [leaderCurrentTime, setLeaderCurrentTime] = useState(0);
    const [leaderDuration, setLeaderDuration] = useState(0);
    const [isLeaderPlaying, setIsLeaderPlaying] = useState(false);

    const syncIntervalRef = useRef<number | null>(null);

    const clearIntervals = () => {
        if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
    };

    const handlePlayerReady: YouTubeProps['onReady'] = (event) => {
        playerRef.current = event.target;
        setIsPlayerReady(true);
    };

    const handlePlayerStateChange: YouTubeProps['onStateChange'] = async () => {
        if (!isLeader || !playerRef.current) return;

        const playerState = await playerRef.current.getPlayerState();
        const isPlayingNow = playerState === YouTube.PlayerState.PLAYING;

        setIsLeaderPlaying(isPlayingNow);
        setLeaderDuration(await playerRef.current.getDuration());

        if (playerState === YouTube.PlayerState.ENDED) {
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
                currentTime: await playerRef.current.getCurrentTime(),
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
        setLeaderCurrentTime(newTime); // Update UI immediately
        // Broadcast seek event
        onSendPlaybackState({
            eventType: 'seek',
            isPlaying: true, // Assume play after seek
            currentTime: newTime,
            videoId: currentSong.youtubeVideoId,
        });
    }, [currentSong, onSendPlaybackState]);

    // LEADER: Periodic Syncing
    useEffect(() => {
        clearIntervals();
        if (isLeader && isPlayerReady && playerRef.current && isLeaderPlaying && currentSong?.youtubeVideoId) {
            const videoId = currentSong.youtubeVideoId;
            syncIntervalRef.current = window.setInterval(async () => {
                const player = playerRef.current;
                if (!player) return;
                const currentTime = await player.getCurrentTime();
                setLeaderCurrentTime(currentTime);
                onSendPlaybackState({ eventType: 'sync', isPlaying: true, currentTime, videoId });
            }, SYNC_INTERVAL_MS);
        }
        return clearIntervals;
    }, [isLeader, isPlayerReady, isLeaderPlaying, currentSong, onSendPlaybackState]);

    // FOLLOWER: React to External State
    useEffect(() => {
        if (!isLeader && isPlayerReady && playerRef.current && externalPlaybackState && currentSong?.youtubeVideoId === externalPlaybackState.videoId) {
            const syncFollower = async () => {
                const player = playerRef.current;
                if (!player) return;
                
                const remoteState = externalPlaybackState;
                const playerState = await player.getPlayerState();

                if (remoteState.isPlaying && playerState !== YouTube.PlayerState.PLAYING) {
                    console.log('[Follower] Correcting state to PLAY');
                    player.playVideo();
                } else if (!remoteState.isPlaying && playerState === YouTube.PlayerState.PLAYING) {
                    console.log('[Follower] Correcting state to PAUSE');
                    player.pauseVideo();
                }

                const localTime = await player.getCurrentTime();
                const timeDiff = Math.abs(localTime - remoteState.currentTime);

                if (timeDiff > SYNC_THRESHOLD_S) {
                    console.log(`[Follower] Resyncing time. Local: ${localTime.toFixed(2)}, Remote: ${remoteState.currentTime.toFixed(2)}, Diff: ${timeDiff.toFixed(2)}`);
                    player.seekTo(remoteState.currentTime, true);
                }
            };
            
            syncFollower();
        }
    }, [externalPlaybackState, isLeader, isPlayerReady, currentSong]);

    const playerOpts: YouTubeProps['opts'] = {
        height: '100%', width: '100%',
        playerVars: {
            autoplay: isLeader ? 1 : 0,
            controls: isLeader ? 1 : 0,
            modestbranding: 1, rel: 0,
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