// File: src/components/features/room/AddSongForm.tsx
// Purpose: Form for adding new songs to the playlist.
// Location: src/components/features/room/

import React from 'react';

 interface AddSongFormProps {
     roomId: string;
    // Pass onSubmit handler/websocket function later
 }

const AddSongForm: React.FC<AddSongFormProps> = ({roomId}) => {
     // State for title, artist, loading will be added

    return (
         <div>
            <h3>Add Song</h3>
             {/* Inputs and button will go here using shadcn */}
             <input type="text" placeholder="Song Title" />
             <input type="text" placeholder="Artist" />
             <button>Add</button>
         </div>
    );
};

export default AddSongForm;