// File: src/components/features/room/HeaderControls.tsx
// Purpose: Displays Room ID, Share button, Leave button.
// Location: src/components/features/room/

import React from 'react';

interface HeaderControlsProps {
     roomId: string;
     onLeave: () => void;
}

const HeaderControls: React.FC<HeaderControlsProps> = ({ roomId, onLeave }) => {
    return (
         <header className="flex justify-between items-center">
            {/* Left Side */}
            <div className="flex items-center gap-4">
                <span>Room ID: {roomId}</span>
                <button onClick={onLeave}>Leave Room</button>
             </div>
             {/* Right Side */}
            <div>
                <button>Share Room (Copy ID)</button>
            </div>
        </header>
    );
};

export default HeaderControls;