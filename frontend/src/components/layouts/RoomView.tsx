// File: src/components/layouts/RoomView.tsx
// Purpose: Main layout for the collaborative room view (header, columns).
// Location: src/components/layouts/

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
    onSendPlaybackState: (state: Omit<PlaybackStateDto, 'triggeredBy'>) => void;
    externalPlaybackState: PlaybackStateDto | null;
    onLeaveRoom: () => void;
    playlistSongs: PlaylistSongDto[];
    onAddSong: (title: string, artist: string) => void;
    onRemoveSong: (songId: string) => void;
    isWsConnected: boolean;
    onAddSongFromApp: (youtubeVideoId: string, title?: string, artist?: string) => void;
    onSongEnded: (songId: string | null) => void;
    onSkipSong: () => void;
}

const RoomView: React.FC<RoomViewProps> = ({
    roomId,
    roomName,
    username,
    isLeader,
    onSendPlaybackState,
    externalPlaybackState,
    onLeaveRoom,
    playlistSongs,
    onAddSong,
    onRemoveSong,
    isWsConnected,
    onAddSongFromApp,
    onSongEnded,
    onSkipSong,
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
                            onAddSongViaForm={onAddSongFromApp}
                        />
                    </aside>
                </div>
            </main>
        </div>
    );
};
export default RoomView;