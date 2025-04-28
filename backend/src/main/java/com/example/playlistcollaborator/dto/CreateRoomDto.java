// File: src/main/java/com/example/playlistcollaborator/dto/CreateRoomDto.java
// Purpose: Data Transfer Object for creating a new Room via API request.
// Location: src/main/java/com/example/playlistcollaborator/dto/

package com.example.playlistcollaborator.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateRoomDto {
    // Could add validation annotations later (e.g., @Size)
    private String name; // Optional name for the room
}