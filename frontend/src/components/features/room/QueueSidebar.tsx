// File: src/components/features/room/QueueSidebar.tsx
// Purpose: Container for the Add Song form and the Playlist.
// Location: src/components/features/room/

import React from 'react';
import AddSongForm from './AddSongForm';
import Playlist from './Playlist';

interface QueueSidebarProps {
     username: string;
     roomId: string;
     // Pass websocket/API functions later
}

const QueueSidebar: React.FC<QueueSidebarProps> = ({ username, roomId }) => {
     return (
          <div className="flex flex-col h-full gap-4"> {/* h-full is key here */}
               <AddSongForm roomId={roomId} onAddSong={() => {}} /> {/* pass onAddSong later */}
               {/* Playlist component needs to grow */}
               <div className="flex-grow min-h-0"> {/* Wrapper to allow Playlist to grow */}
                    <Playlist />
               </div>
          </div>
     );
};

export default QueueSidebar;