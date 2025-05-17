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
    private String title;
    private String artist;
    private String username;
}