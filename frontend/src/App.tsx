import { useState, useCallback } from 'react';
import { Toaster, toast } from 'react-hot-toast'; // Ensure toast is imported directly for use
import EntryModal from './components/features/entry/EntryModal';
import RoomView from './components/layouts/RoomView';
import './index.css';
import { RoomDto, CreateRoomDto } from './types/dtos'; // Import DTO types

const API_BASE_URL = '/api'; // Using Vite proxy, so path is relative to frontend host

function App() {
    const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
    const [username, setUsername] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    // Optional: Store the full room details if needed elsewhere
    // const [currentRoomDetails, setCurrentRoomDetails] = useState<RoomDto | null>(null);

    const handleJoinOrCreate = useCallback(async (user: string, roomIdToJoin?: string) => {
        console.log(`Attempting to join/create. User: ${user}, Room ID: ${roomIdToJoin || 'New Room'}`);
        setIsLoading(true);
        setUsername(user); // Set username immediately

        try {
            let finalRoomData: RoomDto;

            if (roomIdToJoin) {
                // --- Attempt to JOIN an existing room ---
                console.log(`Fetching room ${roomIdToJoin}...`);
                const response = await fetch(`${API_BASE_URL}/rooms/${roomIdToJoin}`);

                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error(`Room "${roomIdToJoin}" not found.`);
                    }
                    // Try to parse error from backend if available
                    try {
                        const errorData = await response.json();
                        throw new Error(errorData.message || `Failed to fetch room: ${response.statusText}`);
                    } catch (parseError) {
                        throw new Error(`Failed to fetch room: ${response.statusText}`);
                    }
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

                if (!response.ok) {
                    try {
                        const errorData = await response.json();
                        throw new Error(errorData.message || `Failed to create room: ${response.statusText}`);
                    } catch (parseError) {
                        throw new Error(`Failed to create room: ${response.statusText}`);
                    }
                }
                finalRoomData = await response.json() as RoomDto;
                toast.success(`New room "${finalRoomData.publicId}" created!`);
                console.log('Created room:', finalRoomData);
            }

            setCurrentRoomId(finalRoomData.publicId);
            // setCurrentRoomDetails(finalRoomData); // Optionally store full details

            // TODO: Initialize WebSocket connection here, pass finalRoomData.publicId

        } catch (error) {
            console.error("Failed to join or create room:", error);
            toast.error((error as Error).message || 'An unexpected error occurred.');
            // Reset only if critical, or let user retry from modal
            // setCurrentRoomId(null);
            // setUsername(''); // Don't clear username, let user retry if it was a network issue.
        } finally {
            setIsLoading(false);
        }
    }, []); // Dependencies will be username if used in API calls, but it's set right before.

    const handleLeaveRoom = useCallback(() => {
        console.log(`Leaving room ${currentRoomId}`);
        // TODO: Disconnect WebSocket here
        setCurrentRoomId(null);
        //setCurrentRoomDetails(null);
        // Keep username unless explicit logout. Modal will reappear.
        toast('You have left the room.');
    }, [currentRoomId]);


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
                    username={username}
                    onLeaveRoom={handleLeaveRoom}
                // Pass initial room details if needed for playlist:
                // initialRoomData={currentRoomDetails}
                />
            )}

            <Toaster
                position="top-right"
                reverseOrder={false}
                toastOptions={{
                    className: '', // Add base classes if needed
                    style: {
                        background: '#333', // Darker background for toasts
                        color: '#fff',    // Light text for toasts
                    },
                    success: {
                        // duration: 3000,
                        // theme: { primary: 'green', secondary: 'black',},
                    },
                    error: {
                        // duration: 5000,
                    },
                }}
            />
        </div>
    );
}

export default App;