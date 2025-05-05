// File: src/components/features/room/CurrentlyPlaying.tsx
// Purpose: Displays the details/image of the currently playing song.
// Location: src/components/features/room/

import React from 'react';

const CurrentlyPlaying: React.FC = () => {
    return (
        <div className="p-4 rounded bg-muted h-full flex items-center justify-center">
            {/* Placeholder for album art/visualizer */}
             <p className="text-muted-foreground">Current Song Display Area</p>
         </div>
    );
};

export default CurrentlyPlaying;