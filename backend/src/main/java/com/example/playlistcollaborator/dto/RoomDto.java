// Purpose: Data Transfer Object for Room details, including its playlist.

package com.example.playlistcollaborator.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;


@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoomDto {
    private String publicId;
    private String name;
    private LocalDateTime createdAt;
    private List<PlaylistSongDto> playlistSongs; // Embed the list of song DTOs
}