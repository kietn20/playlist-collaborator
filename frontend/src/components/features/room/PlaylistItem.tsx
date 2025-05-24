// File: src/components/features/room/PlaylistItem.tsx
// Purpose: Renders a single item in the playlist queue.
// Location: src/components/features/room/

import React from 'react';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// Define a type for the song object (adjust as needed)
interface Song {
    id: string | number;
    title: string;
    artist: string;
    addedByUsername?: string; // Username of who added it
}

interface PlaylistItemProps {
    song: Song;
    onRemove: () => void; // Function to remove the song
    currentUsername: string;
}

const PlaylistItem: React.FC<PlaylistItemProps> = ({ song, onRemove, currentUsername }) => {
    const isOwnSong = song.addedByUsername === currentUsername;

    return (
        <li className={cn(
            "p-2 border-b border-gray-200/30 last:border-b-0 hover:bg-muted/50 transition-colors ease-in-out duration-150 flex justify-between items-center group",
            isOwnSong && "bg-primary/10" 
        )}>
            <div>
                <div>
                    <span className="font-medium text-primary">{song.title}</span>
                    <span className="text-sm text-muted-foreground"> - {song.artist}</span>
                </div>
                {song.addedByUsername && (
                    <div className={cn(
                        "text-xs opacity-80 mt-0.5",
                        isOwnSong ? "text-custom-accent font-semibold" : "text-custom-secondary" // Different style for "Added by you"
                    )}>
                        Added by: {isOwnSong ? "You" : song.addedByUsername}
                    </div>
                )}
            </div>
            {/* Consider who can remove songs - for now, anyone */}
            <Button
                variant="ghost"
                size="icon"
                onClick={onRemove}
                className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Remove song"
            >
                <XCircle size={16} />
            </Button>
        </li>
    );
};
export default PlaylistItem;