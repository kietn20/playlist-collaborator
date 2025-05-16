// File: src/components/features/room/Playlist.tsx
// Purpose: Displays the list/queue of upcoming songs.
// Location: src/components/features/room/

import React from 'react';
import PlaylistItem from './PlaylistItem';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PlaylistSongDto } from '@/types/dtos';


interface PlaylistProps { // Define props
    songs: PlaylistSongDto[];
    username: string; // For identifying user's own songs if needed for styling
}

const Playlist: React.FC<PlaylistProps> = ({ songs, username }) => { // Use props
    return (
        <div className="flex flex-col h-full">
            <h4 className="text-md font-semibold mb-2 text-primary px-1">Queue</h4>
            <ScrollArea className="flex-grow border rounded-md bg-muted/20">
                <div className="p-2">
                    {songs.length === 0 ? (
                        <p className="text-muted-foreground text-sm p-4 text-center">Playlist is empty.</p>
                    ) : (
                        <ul className="space-y-1">
                            {songs.map(song => (
                                <PlaylistItem
                                    key={song.id}
                                    song={song}
                                // Pass current username to highlight user's own additions later
                                // isOwnSong={song.addedByUsername === username}
                                />
                            ))}
                        </ul>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
};
export default Playlist;