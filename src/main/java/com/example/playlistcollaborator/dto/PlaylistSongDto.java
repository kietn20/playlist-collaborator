package com.example.playlistcollaborator.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

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
}
