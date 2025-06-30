// File: src/components/layouts/RoomView.tsx

import React from 'react';
import HeaderControls from '../features/room/HeaderControls';
import CurrentlyPlaying from '../features/room/CurrentlyPlaying';
import QueueSidebar from '../features/room/QueueSidebar';
import { PlaylistSongDto, PlaybackStateDto } from '@/types/dtos';

interface RoomViewProps {
    roomId: string;
    roomName: string | null;
    username: string;
    isLeader: boolean;
    isWsConnected: boolean;
    playlistSongs: PlaylistSongDto[];
    externalPlaybackState: PlaybackStateDto | null;
    onLeaveRoom: () => void;
    onSkipSong: () => void;
    onSongEnded: (songId: string | null) => void;
    onRemoveSong: (songId: string) => void;
    onAddSong: (youtubeVideoId: string, title?: string, artist?: string) => void;
    onSendPlaybackState: (state: Omit<PlaybackStateDto, 'triggeredBy'>) => void;
}

const RoomView: React.FC<RoomViewProps> = ({
    roomId,
    roomName,
    username,
    isLeader,
    isWsConnected,
    playlistSongs,
    externalPlaybackState,
    onLeaveRoom,
    onSkipSong,
    onSongEnded,
    onRemoveSong,
    onAddSong,
    onSendPlaybackState,
}) => {
    return (
        <div className="flex flex-col h-screen p-4 bg-background text-foreground font-sans">
            <HeaderControls
                roomId={roomId}
                roomName={roomName}
                onLeave={onLeaveRoom}
                isWsConnected={isWsConnected}
                onSkipSong={onSkipSong}
                canSkip={playlistSongs.length > 0}
            />
            <main className="flex-grow flex mt-4 gap-4 justify-center items-start">
                <div className="flex flex-row w-full max-w-screen-xl h-[calc(100%-1rem)] gap-6 p-4 bg-card rounded-lg shadow-xl">
                    <div className="w-3/4 h-full">
                        <CurrentlyPlaying
                            currentSong={playlistSongs.length > 0 ? playlistSongs[0] : null}
                            onSongEnded={onSongEnded}
                            isLeader={isLeader}
                            onSendPlaybackState={onSendPlaybackState}
                            externalPlaybackState={externalPlaybackState}
                        />
                    </div>
                    <aside className="w-1/4 h-full flex flex-col">
                        <QueueSidebar
                            username={username}
                            roomId={roomId}
                            playlistSongs={playlistSongs}
                            onAddSong={onAddSong}
                            onRemoveSong={onRemoveSong}
                        />
                    </aside>
                </div>
            </main>
        </div>
    );
};
export default RoomView;