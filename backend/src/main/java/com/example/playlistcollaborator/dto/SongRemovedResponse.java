// File: src/main/java/com/example/playlistcollaborator/dto/SongRemovedResponse.java
package com.example.playlistcollaborator.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SongRemovedResponse {
    private UUID songId; // The ID of the song that was removed
}