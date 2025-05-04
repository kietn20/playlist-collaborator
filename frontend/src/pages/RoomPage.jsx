// Example Stub: src/pages/RoomPage.jsx
import React from "react";

const RoomPage = ({ username, roomId, onDisconnect }) => {
  return (
    <div>
      <h1>Room Page</h1>
      <p>
        Welcome, {username}! Room ID: {roomId}
      </p>
      <button onClick={onDisconnect}>Disconnect</button>
      {/* Placeholder for main layout */}
      <div
        style={{
          display: "flex",
          border: "1px solid red",
          padding: "10px",
          width: "90vw",
          height: "80vh",
        }}
      >
        <div style={{ flex: "3", border: "1px solid blue" }}>
          Now Playing Area (3/4)
        </div>
        <div style={{ flex: "1", border: "1px solid green" }}>
          Aside: Add Song + Queue (1/4)
        </div>
      </div>
    </div>
  );
};

export default RoomPage;
