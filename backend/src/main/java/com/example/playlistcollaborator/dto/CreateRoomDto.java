// Purpose: Data Transfer Object for creating a new Room via API request.

package com.example.playlistcollaborator.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateRoomDto {
    private String name; // Optional name for the room
}