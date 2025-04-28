// File: src/main/java/com/example/playlistcollaborator/dto/AddSongRequest.java
// Purpose: DTO representing a client's request to add a song via WebSocket.
// Location: src/main/java/com/example/playlistcollaborator/dto/

package com.example.playlistcollaborator.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AddSongRequest {
    // We don't need roomPublicId here if the client sends to a room-specific destination like /app/room/{roomId}/addSong
    private String title;
    private String artist;
    // Could add 'requester' field later if user accounts are added
}