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
        <div className="flex flex-col h-screen p-4 bg-background text-foreground font-sans"> {/* Added font-sans */}
            <HeaderControls
                roomId={roomId}
                onLeave={onLeaveRoom}
            />
            <main className="flex-grow flex mt-4 gap-4 justify-center items-start"> {/* items-start instead of items-center if content height differs */}
                <div className="flex flex-row w-full max-w-screen-xl h-[calc(100%-1rem)] gap-6 p-4 bg-card rounded-lg shadow-xl"> {/* max-w-screen-xl for wider screens, and calc for height with padding*/}
                    {/* Left Column (Currently Playing) */}
                    <div className="w-3/4 h-full"> {/* Added h-full */}
                        <CurrentlyPlaying />
                    </div>
                    {/* Right Column (Queue Sidebar) */}
                    <aside className="w-1/4 h-full flex flex-col"> {/* Added h-full and flex flex-col */}
                        <QueueSidebar username={username} roomId={roomId} />
                    </aside>
                </div>
            </main>
        </div>
    );
};

export default RoomView;