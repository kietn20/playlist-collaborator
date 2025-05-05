// File: src/components/features/room/PlaylistItem.tsx
// Purpose: Renders a single item in the playlist queue.
// Location: src/components/features/room/

import React from 'react';

// Define a type for the song object (adjust as needed)
interface Song {
     id: string | number;
     title: string;
     artist: string;
     addedBy?: string; // Username of who added it
 }

 interface PlaylistItemProps {
     song: Song;
 }

const PlaylistItem: React.FC<PlaylistItemProps> = ({ song }) => {
     return (
         <li className="p-2 border-b last:border-b-0 hover:bg-muted/50 transition-colors ease-in-out duration-150">
             <div>
                 <span className="font-medium">{song.title}</span> - <span className="text-sm text-muted-foreground">{song.artist}</span>
             </div>
            {song.addedBy && <div className="text-xs text-secondary">Added by: {song.addedBy}</div>}
            {/* Add action buttons (remove, etc.) later */}
         </li>
    );
};

export default PlaylistItem;