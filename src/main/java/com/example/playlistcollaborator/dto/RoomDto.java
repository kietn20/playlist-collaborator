package com.example.playlistcollaborator.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoomDto {
    private String publicId;
    private String name;
    private LocalDateTime createdAt;
    private List<PlaylistSongDto> playlistSongs;
}
