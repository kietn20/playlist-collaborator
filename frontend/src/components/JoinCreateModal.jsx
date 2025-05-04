// Example Stub: src/components/JoinCreateModal.jsx
import React from "react";

const JoinCreateModal = ({ isOpen, onSubmit, onClose }) => {
  if (!isOpen) return null;

  // Basic structure - we'll replace this with MUI Modal/Dialog later
  return (
    <div
      style={{
        background: "grey",
        padding: "20px",
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      }}
    >
      <h2>Join or Create Room</h2>
      <p>Modal Content Placeholder</p>
      <button onClick={() => onSubmit({ username: "testUser", roomId: "" })}>
        Simulate Create
      </button>
      <button onClick={() => onSubmit({ username: "testUser", roomId: "abc" })}>
        Simulate Join abc
      </button>
      {/* <button onClick={onClose}>Close</button> */}
    </div>
  );
};

export default JoinCreateModal;
