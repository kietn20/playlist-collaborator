// Purpose: Custom exception for when a requested Room cannot be found.

package com.example.playlistcollaborator.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

// This annotation maps the exception to an HTTP 404 Not Found status code automatically
@ResponseStatus(value = HttpStatus.NOT_FOUND)
public class RoomNotFoundException extends RuntimeException {

    public RoomNotFoundException(String publicId) {
        super("Room not found with publicId: " + publicId);
    }

    public RoomNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}