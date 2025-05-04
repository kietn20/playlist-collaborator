// File: src/App.jsx
// Purpose: Main application component, routing, context providers.
// Location: karmonic-frontend/src/

import React, { useState } from "react";
import { Toaster, toast } from "react-hot-toast"; // Import toast components
// Import component placeholders (we will create these next)
import JoinCreateModal from "./components/JoinCreateModal";
import RoomPage from "./pages/RoomPage";

function App() {
  // --- State ---
  // Manages user details once logged in/joined
  const [userDetails, setUserDetails] = useState({
    username: null,
    roomId: null,
  });
  // Determines if the modal should be shown initially
  const [showModal, setShowModal] = useState(true);

  // Placeholder functions for handling joining/creating/leaving
  const handleJoinOrCreate = ({ username, roomId }) => {
    console.log("Attempting Join/Create:", { username, roomId });
    // TODO: Implement actual WebSocket connection/REST calls
    // Simulate successful join for now
    toast.success(
      `Welcome, ${username}! ${
        roomId ? `Joined room ${roomId}` : "Created new room"
      }`
    );
    setUserDetails({ username, roomId: roomId || "temp-new-room-id" }); // Use actual ID later
    setShowModal(false); // Hide modal on success
  };

  const handleDisconnect = () => {
    console.log("Disconnecting...");
    // TODO: Implement actual WebSocket disconnection
    toast("Disconnected!", { icon: "👋" });
    setUserDetails({ username: null, roomId: null });
    setShowModal(true); // Show modal again
  };

  // Determine if user is currently in a room
  const isInRoom = userDetails.username && userDetails.roomId;

  return (
    <div className="min-h-screen bg-background text-text flex flex-col items-center justify-center font-sans p-4">
      {/* Global Toaster container */}
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          className: "font-sans", // Apply font
          style: {
            background: "#333", // Dark background for toasts
            color: "#fff", // Light text for toasts
          },
          success: {
            duration: 3000,
          },
        }}
      />

      {!isInRoom ? (
        // Show modal only if not in room and modal flag is true (or on initial load)
        <JoinCreateModal
          isOpen={showModal} // Control visibility
          onSubmit={handleJoinOrCreate}
          // onClose={() => setShowModal(false)} // Optional: allow closing modal explicitly?
        />
      ) : (
        // If in room, show the Room Page
        <RoomPage
          username={userDetails.username}
          roomId={userDetails.roomId}
          onDisconnect={handleDisconnect}
        />
      )}
    </div>
  );
}

export default App;
