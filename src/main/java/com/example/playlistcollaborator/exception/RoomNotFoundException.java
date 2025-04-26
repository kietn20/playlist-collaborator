package com.example.playlistcollaborator.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value = HttpStatus.NOT_FOUND)
public class RoomNotFoundException extends RuntimeException{

    public RoomNotFoundException(String publicId) {
        super("Room not found with public id: " + publicId);
    }

    public RoomNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}
