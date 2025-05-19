import React, { useState, useCallback, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import EntryModal from './components/features/entry/EntryModal';
import RoomView from './components/layouts/RoomView';
import './index.css';
import { RoomDto, CreateRoomDto, PlaylistSongDto } from './types/dtos'; // Make sure PlaylistSongDto is imported
import { usePlaylistWebSocket } from './hooks/usePlaylistWebSocket'; // Import the hook

const API_BASE_URL = '/api'; // Using Vite proxy, so path is relative to frontend host

function App() {
    const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
    const [username, setUsername] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [currentRoomName, setCurrentRoomName] = useState<string | null>(null); // For displaying room name

    const [playlistSongs, setPlaylistSongs] = useState<PlaylistSongDto[]>([]);

    // --- WebSocket Integration ---
    const handleWebSocketPlaylistUpdate = useCallback((newSong: PlaylistSongDto) => {
        // Add the new song to the existing list
        // Ensure no duplicates if messages are somehow re-processed (optional check by ID)
        setPlaylistSongs(prevSongs => {
            if (prevSongs.find(s => s.id === newSong.id)) {
                return prevSongs; // Already exists, defensive
            }
            // Ensure songs are sorted by addedAt or maintain insertion order
            // If backend sends them in order or `newSong` is always the latest
            return [...prevSongs, newSong].sort((a, b) => new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime());
        });
    }, []);


    const handleWebSocketSongRemoved = useCallback((removedSongId: string) => {
        setPlaylistSongs(prevSongs => prevSongs.filter(song => song.id !== removedSongId));
    }, []);

    const { isConnected: isWsConnected, sendAddSongMessage, sendRemoveSongMessage } = usePlaylistWebSocket({
        roomId: currentRoomId,
        username: username,
        onPlaylistUpdate: handleWebSocketPlaylistUpdate, // from previous step
        onSongRemoved: handleWebSocketSongRemoved,     // <<< PASS NEW CALLBACK
        onInitialPlaylist: (initialSongs) => { // Callback to set the initial playlist (currently not used by hook, REST provides it)
            setPlaylistSongs(initialSongs.sort((a, b) => new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime()));
        }
    });


    // --- API Call Logic ---
    const handleJoinOrCreate = useCallback(async (user: string, roomIdToJoin?: string) => {
        console.log(`Attempting to join/create. User: ${user}, Room ID: ${roomIdToJoin || 'New Room'}`);
        setIsLoading(true);
        setUsername(user); // Set username immediately
        setPlaylistSongs([]); // Clear previous playlist on new room attempt

        try {
            let finalRoomData: RoomDto;

            if (roomIdToJoin) {
                // --- Attempt to JOIN an existing room ---
                console.log(`Fetching room ${roomIdToJoin}...`);
                const response = await fetch(`${API_BASE_URL}/rooms/${roomIdToJoin}`);
                if (!response.ok) { /* ... error handling ... */
                    if (response.status === 404) throw new Error(`Room "${roomIdToJoin}" not found.`);
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || `Failed to fetch room: ${response.statusText}`);
                }
                finalRoomData = await response.json() as RoomDto;
                console.log('Joined room:', finalRoomData);
            } else {
                // --- Attempt to CREATE a new room ---
                console.log("Creating new room...");
                const createDto: CreateRoomDto = { name: `${user}'s New Room` }; // Optional: Give it a default name

                const response = await fetch(`${API_BASE_URL}/rooms`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(createDto),
                });

                if (!response.ok) { /* ... error handling ... */
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || `Failed to create room: ${response.statusText}`);
                }
                finalRoomData = await response.json() as RoomDto;
                toast.success(`New room "${finalRoomData.publicId}" created!`);
                console.log('Created room:', finalRoomData);
            }

            setCurrentRoomId(finalRoomData.publicId);
            setCurrentRoomName(finalRoomData.name);
            // Set initial playlist from REST API response
            setPlaylistSongs(finalRoomData.playlistSongs.sort((a, b) => new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime()) || []);

            // WebSocket connection will be initiated by the hook's useEffect due to currentRoomId change
            // No explicit WS connect call needed here.


        } catch (error) {
            console.error("Failed to join or create room:", error);
            toast.error((error as Error).message || 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, []); // Dependencies will be username if used in API calls, but it's set right before.

    // --- Leave Room Logic ---
    const handleLeaveRoom = useCallback(() => {
        console.log(`Leaving room ${currentRoomId}`);
        // WebSocket disconnection is handled by the hook's useEffect cleanup when currentRoomId becomes null
        setCurrentRoomId(null);
        setCurrentRoomName(null);
        setPlaylistSongs([]); // Clear playlist
        toast('You have left the room.');
        // Keep username so user doesn't have to re-enter if they join another room
    }, [currentRoomId]);

    // Log WebSocket connection status for debugging
    useEffect(() => {
        if (currentRoomId) { // Only log if we expect to be connected
            console.log("[App] WebSocket Connected: ", isWsConnected);
            // Could show a visual indicator for WS connection too if desired
        }
    }, [isWsConnected, currentRoomId]);


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
                    roomName={currentRoomName} // Pass roomName
                    username={username}
                    onLeaveRoom={handleLeaveRoom}
                    // Pass playlist state and song adding function
                    playlistSongs={playlistSongs}
                    onAddSong={(title, artist) => {
                        // Pass the current username from App's state
                        sendAddSongMessage(title, artist, username);
                    }}
                    onRemoveSong={(songId) => sendRemoveSongMessage(songId)}
                    isWsConnected={isWsConnected} // Optionally pass WS connection status
                />
            )}

            <Toaster
                position="top-right"
                reverseOrder={false}
                toastOptions={{
                    className: '',
                    style: { background: '#333', color: '#fff' },
                }}
            />
        </div>
    );
}

export default App;