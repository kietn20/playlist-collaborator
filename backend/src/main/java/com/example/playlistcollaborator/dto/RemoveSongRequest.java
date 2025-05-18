// File: src/main/java/com/example/playlistcollaborator/dto/RemoveSongRequest.java
package com.example.playlistcollaborator.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RemoveSongRequest {
    private UUID songId; // The ID of the song to remove
    // private String username; // Optional: For an audit trail or if only specific users can remove
}