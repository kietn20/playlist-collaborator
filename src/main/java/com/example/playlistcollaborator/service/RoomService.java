// File: src/main/java/com/example/playlistcollaborator/service/RoomService.java
// Purpose: Interface defining the contract for Room service operations.
// Location: src/main/java/com/example/playlistcollaborator/service/

package com.example.playlistcollaborator.service;

import com.example.playlistcollaborator.dto.AddSongRequest;
import com.example.playlistcollaborator.dto.CreateRoomDto;
import com.example.playlistcollaborator.dto.PlaylistSongDto;
import com.example.playlistcollaborator.dto.RoomDto;

import java.util.Optional;

public interface RoomService {
    /**
     * Creates a new Room.
     * @param createRoomDto DTO containing creation details (e.g., name).
     * @return DTO representing the newly created room.
     */
    RoomDto createRoom(CreateRoomDto createRoomDto);

    /**
     * Finds a Room by its public identifier.
     * @param publicId The public identifier of the room.
     * @return An Optional containing the RoomDto if found, otherwise empty.
     */
    Optional<RoomDto> findRoomByPublicId(String publicId);

    PlaylistSongDto addSongToRoom(String publicId, AddSongRequest addSongRequest);

}