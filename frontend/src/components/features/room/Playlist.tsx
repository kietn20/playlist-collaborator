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
        <div className="flex flex-col h-full"> {/* Changed to h-full */}
            <h4 className="text-md font-semibold mb-2 text-primary px-1">Queue</h4> {/* px to align with scroll area content */}
            <ScrollArea className="flex-grow border rounded-md bg-muted/20"> {/* ScrollArea itself takes the space */}
                <div className="p-2"> {/* Inner padding for content */}
                    {songs.length === 0 ? (
                        <p className="text-muted-foreground text-sm p-4 text-center">Playlist is empty.</p>
                    ) : (
                        <ul className="space-y-1"> {/* Reduce space if too much */}
                            {/* Dummy data: */}
                            {[{ id: 1, title: "Song A", artist: "Artist 1", addedBy: "UserX" }].map(song => (
                                <PlaylistItem key={song.id} song={song} />
                            ))}
                        </ul>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
};

export default Playlist;