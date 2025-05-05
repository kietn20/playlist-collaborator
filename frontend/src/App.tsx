// File: src/App.tsx
// Purpose: Root component, manages state for room joining and renders appropriate view.
// Location: src/

import React, { useState, useCallback } from 'react';
import { Toaster } from 'react-hot-toast'; // Import toaster for notifications
import EntryModal from './components/features/entry/EntryModal';
import RoomView from './components/layouts/RoomView';
import './index.css'; // Ensure global styles and Tailwind are loaded

function App() {
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [username, setUsername] = useState<string>(''); // Store username globally for now
  const [isLoading, setIsLoading] = useState<boolean>(false); // Optional loading state

  // --- Logic to Join/Create Room ---
  // This will be expanded with API calls and WebSocket connection logic
  const handleJoinOrCreate = useCallback(async (user: string, roomId?: string) => {
      console.log(`Attempting to join/create. User: ${user}, Room ID: ${roomId || 'New Room'}`);
      setIsLoading(true);
      setUsername(user); // Set username

      // ** SIMULATE API CALLS & WEBSOCKET CONNECTION (Replace with actual logic later) **
      try {
          let finalRoomId: string;
          if (roomId) {
              // Simulate checking if room exists / joining
              console.log(`Simulating joining room ${roomId}...`);
              await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
              // TODO: Actual fetch GET /api/rooms/{roomId} to validate
               const roomExists = true; // Assume it exists for now
               if(!roomExists) {
                   throw new Error(`Room ${roomId} not found!`);
               }
              finalRoomId = roomId;
          } else {
              // Simulate creating a new room
              console.log("Simulating creating new room...");
              await new Promise(resolve => setTimeout(resolve, 1000));
              // TODO: Actual fetch POST /api/rooms
              const newPublicId = `new-${Math.random().toString(36).substring(2, 10)}`; // Dummy ID
              finalRoomId = newPublicId;
               console.log(`Simulated creation, got ID: ${finalRoomId}`);
          }

           // If successful (room exists or created)
          setCurrentRoomId(finalRoomId); // Set the room ID to switch view

          // TODO: Initialize WebSocket connection here

      } catch (error) {
          console.error("Failed to join or create room:", error);
          // TODO: Use react-hot-toast to show error message
           // Example: toast.error(error.message || 'Failed to connect to room.');
           // Reset state if needed
           setUsername('');
      } finally {
          setIsLoading(false);
      }
  }, []); // Dependencies will be added if needed

  // --- Logic to Leave Room ---
  const handleLeaveRoom = useCallback(() => {
      console.log(`Leaving room ${currentRoomId}`);
      // TODO: Disconnect WebSocket here
      setCurrentRoomId(null);
      setUsername('');
      // Maybe show a toast message confirming departure
       // Example: toast('You have left the room.');
  }, [currentRoomId]);


  return (
      <div className="app-container min-h-screen bg-background">
          {/* Conditionally render EntryModal or RoomView */}
          {!currentRoomId ? (
              <EntryModal onJoinOrCreate={handleJoinOrCreate} />
              // Consider passing isLoading to EntryModal to disable button etc.
          ) : (
              <RoomView
                  roomId={currentRoomId}
                  username={username}
                  onLeaveRoom={handleLeaveRoom}
              />
          )}

           {/* Toaster for notifications - customize position/styling as needed */}
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