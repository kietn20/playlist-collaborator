// File: src/components/layouts/RoomView.tsx
// Purpose: Main layout for the collaborative room view (header, columns).
// Location: src/components/layouts/

import React from 'react';
import HeaderControls from '../features/room/HeaderControls'; // Placeholder path
import CurrentlyPlaying from '../features/room/CurrentlyPlaying'; // Placeholder path
import QueueSidebar from '../features/room/QueueSidebar'; // Placeholder path

interface RoomViewProps {
    roomId: string;
    username: string;
    onLeaveRoom: () => void;
    // Pass WebSocket context/methods later
}

const RoomView: React.FC<RoomViewProps> = ({ roomId, username, onLeaveRoom }) => {
    return (
        <div className="flex flex-col h-screen p-4 bg-background text-foreground">
             {/* Header Area */}
            <HeaderControls
                roomId={roomId}
                onLeave={onLeaveRoom}
            />

             {/* Main Content Area (takes remaining height) */}
            <main className="flex-grow flex mt-4 gap-4 justify-center items-start">
                {/* Central padded container */}
                <div className="flex flex-row w-full max-w-6xl gap-4 p-4 bg-card rounded-lg shadow-md">
                    {/* Left Column (Currently Playing) */}
                    <div className="w-3/4">
                        <CurrentlyPlaying />
                    </div>
                     {/* Right Column (Queue Sidebar) */}
                     <aside className="w-1/4">
                        <QueueSidebar username={username} roomId={roomId}/>
                    </aside>
                </div>
            </main>
        </div>
    );
};

export default RoomView;