// File: src/components/features/room/Playlist.tsx
// Purpose: Displays the list/queue of upcoming songs.
// Location: src/components/features/room/

import React from 'react';
import PlaylistItem from './PlaylistItem';
import { ScrollArea } from '@/components/ui/scroll-area'; // Import ScrollArea

const Playlist: React.FC = () => {
    const songs: any[] = []; // Dummy data for now
     // Fetch actual songs from state/context later

     return (
         <div className="flex flex-col flex-grow min-h-0"> {/* Allow shrinking and set min-height */}
            <h4>Queue</h4>
            <ScrollArea className="flex-grow border rounded-md p-2"> {/* Make ScrollArea grow */}
                 {songs.length === 0 ? (
                    <p className="text-muted-foreground text-sm p-4 text-center">Playlist is empty.</p>
                 ) : (
                    <ul className="space-y-2">
                        {/* Map over actual songs later */}
                        {/* <PlaylistItem key={song.id} song={song} /> */}
                    </ul>
                 )}
            </ScrollArea>
        </div>
    );
};

export default Playlist;