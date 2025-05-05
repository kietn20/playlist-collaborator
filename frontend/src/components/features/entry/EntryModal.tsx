// File: src/components/features/entry/EntryModal.tsx
// Purpose: Modal for user to enter username and join/create a room.
// Location: src/components/features/entry/

import React from 'react';

interface EntryModalProps {
    onJoinOrCreate: (username: string, roomId?: string) => void;
}

const EntryModal: React.FC<EntryModalProps> = ({ onJoinOrCreate }) => {
    // State for username, roomId, loading etc. will be added here

    return (
        <div> {/* Replace with shadcn Dialog */}
            <h2>Welcome! Join or Create a Room</h2>
            {/* Input fields and button will go here */}
            <p>Enter username (required) and Room ID (optional).</p>
            <button onClick={() => onJoinOrCreate('tempUser', 'tempRoom')}>Join/Create (Dummy)</button>
        </div>
    );
};

export default EntryModal;