// File: src/main/java/com/example/playlistcollaborator/controller/PlaylistController.java
// Purpose: Controller for handling WebSocket messages related to playlists.
// Location: src/main/java/com/example/playlistcollaborator/controller/

package com.example.playlistcollaborator.controller;

import com.example.playlistcollaborator.dto.AddSongRequest;
import com.example.playlistcollaborator.dto.PlaylistSongDto;
import com.example.playlistcollaborator.dto.RemoveSongRequest;
import com.example.playlistcollaborator.dto.SongRemovedResponse;
import com.example.playlistcollaborator.service.RoomService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller // Use @Controller, not @RestController for WebSocket controllers
@RequiredArgsConstructor
@Slf4j // Lombok annotation for logging
public class PlaylistController {

    private final RoomService roomService; // Inject service

    /**
     * Handles requests to add a song to a specific room's playlist.
     * Clients send messages to destinations like "/app/room/{publicId}/addSong".
     * The returned PlaylistSongDto is broadcast to all subscribers of "/topic/room/{publicId}/songs".
     *
     * @param publicId The public ID of the room from the destination path.
     * @param request The payload of the message, containing song title and artist.
     * @return The DTO of the newly added song, which will be broadcast.
     * @throws Exception if song cannot be added (e.g., room not found - handled by service/exception handler).
     */
    @MessageMapping("/room/{publicId}/addSong") // Listens for messages sent to this destination
    @SendTo("/topic/room/{publicId}/songs") // Broadcasts the return value to this topic destination
    public PlaylistSongDto addSong(
            @DestinationVariable String publicId, // Extract {publicId} from the destination
            @Payload AddSongRequest request) throws Exception { // Extract message body

        // LOG THE INCOMING REQUEST DTO
        log.info("PlaylistController received AddSongRequest: {}", request.toString()); // Use .toString() from Lombok @Data

        log.info("Received request to add song {} - {} (VideoID: {}) to room {} by user {}",
                request.getTitle(), request.getArtist(), request.getYoutubeVideoId(), publicId, request.getUsername());

        // Delegate the actual song addition logic to the service layer
        PlaylistSongDto addedSong = roomService.addSongToRoom(publicId, request);

        log.info("Broadcasting added song {} to /topic/room/{}/songs", addedSong.getId(), publicId);
        return addedSong; // This object gets automatically serialized (e.g., to JSON) and sent
    }

    @MessageMapping("/room/{publicId}/removeSong")
    @SendTo("/topic/room/{publicId}/songRemoved")
    public SongRemovedResponse removeSong(
            @DestinationVariable String publicId,
            @Payload RemoveSongRequest request) throws Exception {
        log.info("Received request to remove song ID: {} from room {}", request.getSongId(), publicId);

        try {
            roomService.removeSongFromRoom(publicId, request.getSongId());
        } catch (Exception e) {
            log.error("Error removing song {} from room {}: {}", request.getSongId(), publicId, e.getMessage());
            throw e;
        }

        log.info("Broadcasting removed song ID {} to /topic/room/{}/songRemoved", request.getSongId(), publicId);
        return new SongRemovedResponse(request.getSongId());
    }
}