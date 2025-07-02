// Purpose: DTO representing a client's request to add a song via WebSocket.

package com.example.playlistcollaborator.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AddSongRequest {
    private String youtubeVideoId;
    private String title;
    private String artist;
    private String username;
}