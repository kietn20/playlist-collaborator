// File: frontend/src/App.tsx

import { useState, useCallback } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import EntryModal from './components/features/entry/EntryModal';
import RoomView from './components/layouts/RoomView';
import './index.css';
import { RoomDto, CreateRoomDto, PlaylistSongDto, PlaybackStateDto, NextSongWsMessage } from './types/dtos';
import { usePlaylistWebSocket } from './hooks/usePlaylistWebSocket';

const API_BASE_URL = '/api';

function App() {
    const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
    const [username, setUsername] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [currentRoomName, setCurrentRoomName] = useState<string | null>(null);
    const [isLeader, setIsLeader] = useState<boolean>(false);

    const [playlistSongs, setPlaylistSongs] = useState<PlaylistSongDto[]>([]);
    const [playbackState, setPlaybackState] = useState<PlaybackStateDto | null>(null);

    const handleWebSocketSongAdded = useCallback((newSong: PlaylistSongDto) => {
        setPlaylistSongs(prevSongs => {
            if (prevSongs.some(song => song.id === newSong.id)) return prevSongs;
            const updatedList = [...prevSongs, newSong];
            return updatedList.sort((a, b) => new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime());
        });
    }, []);

    const handleWebSocketSongRemoved = useCallback((removedSongId: string) => {
        setPlaylistSongs(prevSongs => prevSongs.filter(song => song.id !== removedSongId));
    }, []);

    const handleWebSocketPlaybackUpdate = useCallback((newState: PlaybackStateDto) => {
        setPlaybackState(newState);
    }, []);

    const handleWebSocketNextSong = useCallback((message: NextSongWsMessage) => {
        console.log(`[App] Received next song event, triggered by ${message.triggeredBy}.`);
        setPlaybackState(null);
        setPlaylistSongs(prev => prev.slice(1));
    }, []);

    const { isConnected: isWsConnected, sendAddSongMessage, sendRemoveSongMessage, sendPlaybackState, sendNextSongEvent } = usePlaylistWebSocket({
        roomId: currentRoomId,
        username: username,
        isLeader: isLeader,
        onPlaylistUpdate: handleWebSocketSongAdded,
        onSongRemoved: handleWebSocketSongRemoved,
        onPlaybackStateUpdate: handleWebSocketPlaybackUpdate,
        onNextSong: handleWebSocketNextSong,
    });

    const handleJoinOrCreate = useCallback(async (user: string, roomIdToJoin?: string) => {
        setIsLoading(true);
        setUsername(user);
        setPlaylistSongs([]);
        setPlaybackState(null); // Reset state on join/create

        try {
            let finalRoomData: RoomDto;
            if (roomIdToJoin) {
                setIsLeader(false);
                const response = await fetch(`${API_BASE_URL}/rooms/${roomIdToJoin}`);
                if (!response.ok) {
                    if (response.status === 404) throw new Error(`Room "${roomIdToJoin}" not found.`);
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || `Failed to fetch room: ${response.statusText}`);
                }
                finalRoomData = await response.json() as RoomDto;
            } else {
                setIsLeader(true);
                const createDto: CreateRoomDto = { name: `${user}'s New Room` };
                const response = await fetch(`${API_BASE_URL}/rooms`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(createDto),
                });
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || `Failed to create room: ${response.statusText}`);
                }
                finalRoomData = await response.json() as RoomDto;
                toast.success(`New room "${finalRoomData.publicId}" created! You are the DJ.`);
            }

            setCurrentRoomId(finalRoomData.publicId);
            setCurrentRoomName(finalRoomData.name);
            setPlaylistSongs(finalRoomData.playlistSongs.sort((a, b) => new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime()) || []);
        } catch (error) {
            console.error("Failed to join or create room:", error);
            toast.error((error as Error).message || 'An unexpected error occurred.');
            setIsLeader(false); // Reset leader status on failure
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleSongEnded = useCallback((endedSongId: string | null) => {
        if (!isLeader) return; // Only the leader's "song ended" event matters

        console.log(`[App] LEADER's song ended, ID: ${endedSongId}`);
        const nextSong = playlistSongs.length > 1 ? playlistSongs[1] : null;
        toast.success(nextSong ? `Now playing: ${nextSong.title}` : 'Playlist finished!');

        // Leader tells everyone to advance to the next song by sending the event
        sendNextSongEvent(nextSong?.id || null);
    }, [isLeader, playlistSongs, sendNextSongEvent]);

    const handleSkipSong = useCallback(() => {
        if (isLeader && playlistSongs.length > 0) {
            const nextSong = playlistSongs.length > 1 ? playlistSongs[1] : null;
            sendNextSongEvent(nextSong?.id || null);
        }
    }, [isLeader, playlistSongs, sendNextSongEvent]);

    const handleLeaveRoom = useCallback(() => {
        setCurrentRoomId(null);
        setCurrentRoomName(null);
        setPlaylistSongs([]);
        setPlaybackState(null);
        setIsLeader(false);
        toast('You have left the room.');
    }, []);

    return (
        <div className="app-container min-h-screen bg-background">
            <EntryModal
                isOpen={!currentRoomId}
                isLoading={isLoading}
                onJoinOrCreate={handleJoinOrCreate}
            />

            {currentRoomId && username && (
                <RoomView
                    roomId={currentRoomId}
                    roomName={currentRoomName}
                    username={username}
                    isLeader={isLeader}
                    onSendPlaybackState={sendPlaybackState}
                    externalPlaybackState={playbackState}
                    onLeaveRoom={handleLeaveRoom}
                    playlistSongs={playlistSongs}
                    // This is the SINGLE, CLEAN prop for adding songs.
                    onAddSong={(youtubeVideoId, title, artist) => {
                        sendAddSongMessage(youtubeVideoId, title, artist, username);
                    }}
                    onRemoveSong={sendRemoveSongMessage}
                    isWsConnected={isWsConnected}
                    onSongEnded={handleSongEnded}
                    onSkipSong={handleSkipSong}
                />
            )}

            <Toaster
                position="top-right"
                reverseOrder={false}
                toastOptions={{ style: { background: '#333', color: '#fff' } }}
            />
        </div>
    );
}

export default App;