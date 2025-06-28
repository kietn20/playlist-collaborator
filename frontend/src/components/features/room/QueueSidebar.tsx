// File: src/components/features/room/QueueSidebar.tsx
// Purpose: Container for the Add Song form and the Playlist.
// Location: src/components/features/room/

import React from 'react';
import AddSongForm from './AddSongForm';
import Playlist from './Playlist';
import { PlaylistSongDto } from '@/types/dtos';

interface QueueSidebarProps {
     username: string;
     roomId: string;
     playlistSongs: PlaylistSongDto[];
     onAddSong: (title: string, artist: string, username: string) => void; // Changed from Promise<void> to void from App
     onRemoveSong: (songId: string) => void;
     onAddSongViaForm: (youtubeVideoId: string, title?: string, artist?: string) => void;
}

const QueueSidebar: React.FC<QueueSidebarProps> = ({ username, roomId, playlistSongs, onRemoveSong, onAddSongViaForm }) => {
     return (
          <div className="flex flex-col h-full gap-4">
               <AddSongForm
                    roomId={roomId}
                    // The onAddSong from the hook is now directly usable



                    // onAddSongFromForm={async (title, artist) => { // Renamed prop to avoid conflict, made it async if form needs it
                    //      try {
                    //           onAddSong(title, artist); // Call the simpler version from App
                    //           // Form can handle its own success/clear if needed, or we rely on WS echo
                    //           return Promise.resolve(); // To satisfy form's async nature
                    //      } catch (e) {
                    //           return Promise.reject(e);
                    //      }
                    // }}


                    onAddSongFromForm={async (videoId, title, artist) => {
                         onAddSongViaForm(videoId, title, artist); // Call the prop from RoomView/App
                         return Promise.resolve();
                    }}
               />
               <div className="flex-grow min-h-0">
                    <Playlist songs={playlistSongs} username={username} onRemoveSong={onRemoveSong} />
               </div>
          </div>
     );
};
export default QueueSidebar;