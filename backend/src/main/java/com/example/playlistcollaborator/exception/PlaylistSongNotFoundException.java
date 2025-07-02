package com.example.playlistcollaborator.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;
import java.util.UUID;

@ResponseStatus(value = HttpStatus.NOT_FOUND)
public class PlaylistSongNotFoundException extends RuntimeException {
    public PlaylistSongNotFoundException(UUID songId) {
        super("Playlist song not found with ID: " + songId);
    }
    public PlaylistSongNotFoundException(UUID songId, String publicRoomId) {
        super("Playlist song with ID: " + songId + " not found in room: " + publicRoomId);
    }
}