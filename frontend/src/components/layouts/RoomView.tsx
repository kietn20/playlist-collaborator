// File: src/components/layouts/RoomView.tsx
// Purpose: Main layout for the collaborative room view (header, columns).
// Location: src/components/layouts/

import React from 'react';
import HeaderControls from '../features/room/HeaderControls';
import CurrentlyPlaying from '../features/room/CurrentlyPlaying';
import QueueSidebar from '../features/room/QueueSidebar';
import { PlaylistSongDto } from '@/types/dtos'; // Import

interface RoomViewProps {
    roomId: string;
    roomName: string | null;
    username: string;
    onLeaveRoom: () => void;
    playlistSongs: PlaylistSongDto[];
    onAddSong: (title: string, artist: string) => void;
    onRemoveSong: (songId: string) => void;
    isWsConnected: boolean;
}

const RoomView: React.FC<RoomViewProps> = ({
    roomId,
    roomName,
    username,
    onLeaveRoom,
    playlistSongs,
    onAddSong,    
    onRemoveSong, 
    isWsConnected 
}) => {
    return (
        <div className="flex flex-col h-screen p-4 bg-background text-foreground font-sans">
            <HeaderControls
                roomId={roomId}
                roomName={roomName} // Pass roomName
                onLeave={onLeaveRoom}
                isWsConnected={isWsConnected} // Pass connection status
            />
            <main className="flex-grow flex mt-4 gap-4 justify-center items-start">
                <div className="flex flex-row w-full max-w-screen-xl h-[calc(100%-1rem)] gap-6 p-4 bg-card rounded-lg shadow-xl">
                    <div className="w-3/4 h-full">
                        <CurrentlyPlaying currentSong={playlistSongs.length > 0 ? playlistSongs[0] : null} /> {/* Example: pass first song */}
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