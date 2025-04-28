// File: src/main/java/com/example/playlistcollaborator/dto/PlaylistSongDto.java
// Purpose: Data Transfer Object for PlaylistSong details.
// Location: src/main/java/com/example/playlistcollaborator/dto/

package com.example.playlistcollaborator.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PlaylistSongDto {
    private UUID id; // Include ID if frontend needs it for specific actions (like delete later)
    private String title;
    private String artist;
    private LocalDateTime addedAt;
}