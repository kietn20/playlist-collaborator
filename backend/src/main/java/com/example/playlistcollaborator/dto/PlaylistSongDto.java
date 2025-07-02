// Purpose: Data Transfer Object for PlaylistSong details.

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
    private UUID id;
    private String title;
    private String artist;
    private LocalDateTime addedAt;
    private String addedByUsername;
    private String youtubeVideoId;
}