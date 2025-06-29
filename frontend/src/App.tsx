import { useState, useCallback, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import EntryModal from './components/features/entry/EntryModal';
import RoomView from './components/layouts/RoomView';
import './index.css';
import { RoomDto, CreateRoomDto, PlaylistSongDto } from './types/dtos'; // Make sure PlaylistSongDto is imported
import { usePlaylistWebSocket } from './hooks/usePlaylistWebSocket'; // Import the hook
import { PlaybackStateDto } from './types/dtos';


const API_BASE_URL = '/api'; // Using Vite proxy, so path is relative to frontend host

function App() {
    const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
    const [username, setUsername] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [currentRoomName, setCurrentRoomName] = useState<string | null>(null);
    const [isLeader, setIsLeader] = useState<boolean>(false);
    const [playbackState, setPlaybackState] = useState<PlaybackStateDto | null>(null);

    const handleWebSocketPlaybackUpdate = useCallback((newState: PlaybackStateDto) => {
        setPlaybackState(newState);
    }, []);

    const [playlistSongs, setPlaylistSongs] = useState<PlaylistSongDto[]>([]);

    // --- WebSocket Integration ---
    const handleWebSocketPlaylistUpdate = useCallback((newSong: PlaylistSongDto) => {
        // Add the new song to the existing list
        // Ensure no duplicates if messages are somehow re-processed (optional check by ID)
        setPlaylistSongs(prevSongs =>
            [...prevSongs, newSong].sort((a, b) => new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime())
        );
    }, []);


    const handleWebSocketSongRemoved = useCallback((removedSongId: string) => {
        setPlaylistSongs(prevSongs => prevSongs.filter(song => song.id !== removedSongId));
    }, []);

    const { isConnected: isWsConnected, sendAddSongMessage, sendRemoveSongMessage, sendPlaybackState, sendNextSongEvent } = usePlaylistWebSocket({
        roomId: currentRoomId,
        username: username,
        isLeader: isLeader,
        onPlaybackStateUpdate: handleWebSocketPlaybackUpdate,
        onPlaylistUpdate: handleWebSocketPlaylistUpdate,
        onSongRemoved: handleWebSocketSongRemoved,
        onInitialPlaylist: (initialSongs) => {
            setPlaylistSongs(initialSongs.sort((a, b) => new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime()));
        },
        onNextSong: () => {
            // Everyone, leader or follower, runs this logic when they get the message
            console.log('[App] Received next song event.');
            setPlaylistSongs(prev => prev.slice(1)); // Advance queue for everyone
        },
    });


    // --- API Call Logic ---
    const handleJoinOrCreate = useCallback(async (user: string, roomIdToJoin?: string) => {
        console.log(`Attempting to join/create. User: ${user}, Room ID: ${roomIdToJoin || 'New Room'}`);
        setIsLoading(true);
        setUsername(user);
        setPlaylistSongs([]);

        try {
            let finalRoomData: RoomDto;
            // let wasRoomCreated = false; // Flag to determine leadership

            if (roomIdToJoin) {
                // --- Attempt to JOIN an existing room ---
                setIsLeader(false); // If joining, you are a follower
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
                setIsLeader(true); // If creating, you are the leader
                // wasRoomCreated = true;
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
                // toast.success(`New room "${finalRoomData.publicId}" created!`);
                toast.success(`New room "${finalRoomData.publicId}" created! You are the DJ.`);

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

    const handleSongEnded = useCallback((endedSongId: string | null) => {
        // console.log(`[App] Song ended, ID: ${endedSongId}`);
        // setPlaylistSongs(prevSongs => {
        //     if (prevSongs.length === 0) return []; // No songs to remove

        //     // Ensure the song that ended is indeed the one at the top of the queue
        //     if (endedSongId && prevSongs[0] && prevSongs[0].id === endedSongId) {
        //         const newPlaylist = prevSongs.slice(1); // Remove the first song
        //         if (newPlaylist.length > 0) {
        //             toast.success(`Now playing: ${newPlaylist[0].title}`);
        //         } else {
        //             toast.success("Playlist finished!");
        //         }
        //         return newPlaylist;
        //     } else if (!endedSongId && prevSongs.length > 0) {
        //         // If no endedSongId provided but queue wasn't empty, assume first song ended
        //         console.warn("[App] Song ended without specific ID, advancing queue.");
        //         const newPlaylist = prevSongs.slice(1);
        //         if (newPlaylist.length > 0) {
        //             toast.success(`Now playing: ${newPlaylist[0].title}`);
        //         } else {
        //             toast.success("Playlist finished!");
        //         }
        //         return newPlaylist;
        //     }
        //     return prevSongs; // No change if IDs don't match or queue was empty
        // });
        if (!isLeader) return; // Only the leader's "song ended" matters

        console.log(`[App] LEADER's song ended, ID: ${endedSongId}`);
        const nextSong = playlistSongs.length > 1 ? playlistSongs[1] : null;
        toast.success(nextSong ? `Now playing: ${nextSong.title}` : 'Playlist finished!');

        // Leader tells everyone to advance to the next song
        sendNextSongEvent(nextSong?.id || null);

    }, [isLeader, playlistSongs, sendNextSongEvent]);
    // }, []); // No direct dependencies here as it operates on state setter

    const handleSkipSong = useCallback(() => {
        if (isLeader && playlistSongs.length > 0) {
            const nextSong = playlistSongs.length > 1 ? playlistSongs[1] : null;
            sendNextSongEvent(nextSong?.id || null);
        }
    }, [isLeader, playlistSongs, sendNextSongEvent]);


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
                    isLeader={isLeader}
                    onSendPlaybackState={sendPlaybackState}
                    externalPlaybackState={playbackState}
                    onLeaveRoom={handleLeaveRoom}
                    // Pass playlist state and song adding function
                    playlistSongs={playlistSongs}
                    onAddSong={(title, artist) => {
                        // Pass the current username from App's state
                        sendAddSongMessage('', title, artist, username); // Passing empty string for youtubeVideoId
                    }}
                    onRemoveSong={(songId) => sendRemoveSongMessage(songId)}
                    isWsConnected={isWsConnected}
                    onAddSongFromApp={(youtubeVideoId, title, artist) => {
                        // `username` is from App's state
                        sendAddSongMessage(youtubeVideoId, title, artist, username);
                    }}
                    onSongEnded={handleSongEnded}
                    onSkipSong={handleSkipSong}
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