import React from 'react';
import AddSongForm from './AddSongForm';
import Playlist from './Playlist';
import { PlaylistSongDto } from '@/types/dtos';

interface QueueSidebarProps {
     username: string;
     roomId: string;
     playlistSongs: PlaylistSongDto[];
     onAddSong: (youtubeVideoId: string, title?: string, artist?: string) => void;
     onRemoveSong: (songId: string) => void;
}

const QueueSidebar: React.FC<QueueSidebarProps> = ({ username, roomId, playlistSongs, onAddSong, onRemoveSong }) => {
     return (
          <div className="flex flex-col h-full gap-4">
               <AddSongForm
                    roomId={roomId}
                    onAddSongFromForm={async (videoId, title, artist) => {
                         onAddSong(videoId, title, artist);
                    }}
               />
               <div className="flex-grow min-h-0">
                    <Playlist songs={playlistSongs} username={username} onRemoveSong={onRemoveSong} />
               </div>
          </div>
     );
};
export default QueueSidebar;