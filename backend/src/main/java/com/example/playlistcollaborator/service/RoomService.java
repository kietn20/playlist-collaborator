// File: src/main/java/com/example/playlistcollaborator/service/RoomService.java
// Purpose: Interface defining the contract for Room service operations.
// Location: src/main/java/com/example/playlistcollaborator/service/

package com.example.playlistcollaborator.service;

import com.example.playlistcollaborator.dto.AddSongRequest;
import com.example.playlistcollaborator.dto.CreateRoomDto;
import com.example.playlistcollaborator.dto.PlaylistSongDto;
import com.example.playlistcollaborator.dto.RoomDto;
import com.example.playlistcollaborator.exception.PlaylistSongNotFoundException;
import com.example.playlistcollaborator.exception.RoomNotFoundException;

import java.util.Optional;
import java.util.UUID;

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

    /**
     * Adds a song to the specified room's playlist.
     * @param publicId The public identifier of the room.
     * @param addSongRequest DTO containing song details (title, artist).
     * @return PlaylistSongDto representing the newly added song.
     * @throws RoomNotFoundException if the room does not exist.
     */
    PlaylistSongDto addSongToRoom(String publicId, AddSongRequest addSongRequest);

    /**
     * Removes a song from the specified room's playlist.
     * @param publicId The public identifier of the room.
     * @param songId The ID of the song to remove.
     * @throws RoomNotFoundException if the room does not exist.
     * @throws PlaylistSongNotFoundException if the song does not exist in the room. // We'll create this
     */
    void removeSongFromRoom(String publicId, UUID songId);

    /**
     * Advances to the next song in the room's playlist.
     * @param publicId The public identifier of the room.
     * @param username The username of the user requesting the next song.
     */
    void advanceToNextSong(String publicId, String username);

}