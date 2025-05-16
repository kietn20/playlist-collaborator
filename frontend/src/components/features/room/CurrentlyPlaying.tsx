// File: src/components/features/room/CurrentlyPlaying.tsx
// Purpose: Displays the details/image of the currently playing song.
// Location: src/components/features/room/

import React from 'react';
import { PlaylistSongDto } from '@/types/dtos';

interface CurrentlyPlayingProps {
    currentSong: PlaylistSongDto | null;
}

const CurrentlyPlaying: React.FC<CurrentlyPlayingProps> = ({ currentSong }) => {
    return (
        <div className="p-4 rounded bg-muted/30 h-full flex flex-col items-center justify-center text-center">
            {currentSong ? (
                <>
                    {/* Placeholder for album art/visualizer - for now a simple box */}
                    <div className="w-64 h-64 md:w-80 md:h-80 bg-muted rounded-md flex items-center justify-center mb-4 shadow-lg">
                        <span className="text-muted-foreground">Album Art</span>
                    </div>
                    <h3 className="text-xl font-semibold text-primary">{currentSong.title}</h3>
                    <p className="text-md text-secondary">{currentSong.artist}</p>
                    {/* Add playback controls later */}
                </>
            ) : (
                <p className="text-muted-foreground">No song currently playing or queue is empty.</p>
            )}
        </div>
    );
};
export default CurrentlyPlaying;