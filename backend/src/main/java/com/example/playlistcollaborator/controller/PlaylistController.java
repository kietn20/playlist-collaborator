// File: src/main/java/com/example/playlistcollaborator/controller/PlaylistController.java
// Purpose: Controller for handling WebSocket messages related to playlists.

package com.example.playlistcollaborator.controller;

import com.example.playlistcollaborator.dto.AddSongRequest;
import com.example.playlistcollaborator.dto.NextSongMessageDto;
import com.example.playlistcollaborator.dto.PlaybackStateDto;
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
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;
import com.example.playlistcollaborator.dto.NextSongRequestDto;

@Controller
@RequiredArgsConstructor
@Slf4j
public class PlaylistController {

    private final RoomService roomService;

    /**
     * Handles requests to add a song to a specific room's playlist.
     * Clients send messages to destinations like "/app/room/{publicId}/addSong".
     * The returned PlaylistSongDto is broadcast to all subscribers of
     * "/topic/room/{publicId}/songs".
     *
     * @param publicId The public ID of the room from the destination path.
     * @param request  The payload of the message, containing song title and artist.
     * @return The DTO of the newly added song, which will be broadcast.
     * @throws Exception if song cannot be added (e.g., room not found - handled by
     *                   service/exception handler).
     */
    @MessageMapping("/room/{publicId}/addSong") 
    @SendTo("/topic/room/{publicId}/songs") 
    public PlaylistSongDto addSong(
            @DestinationVariable String publicId, 
            @Payload AddSongRequest request) throws Exception { 

        log.info("PlaylistController received AddSongRequest: {}", request.toString()); 

        log.info("Received request to add song {} - {} (VideoID: {}) to room {} by user {}",
                request.getTitle(), request.getArtist(), request.getYoutubeVideoId(), publicId, request.getUsername());

        PlaylistSongDto addedSong = roomService.addSongToRoom(publicId, request);

        log.info("Broadcasting added song {} to /topic/room/{}/songs", addedSong.getId(), publicId);
        return addedSong;
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

    @MessageMapping("/room/{publicId}/playbackState")
    @SendTo("/topic/room/{publicId}/playbackState")
    public PlaybackStateDto syncPlaybackState(
            @DestinationVariable String publicId,
            @Payload PlaybackStateDto playbackState,
            SimpMessageHeaderAccessor headerAccessor) { // For getting session attributes/user info

        log.debug("Broadcasting playback state for room {}: {}", publicId, playbackState);
        return playbackState; // Simply broadcast the received state to all subscribers
    }

    @MessageMapping("/room/{publicId}/nextSong")
    @SendTo("/topic/room/{publicId}/nextSong")
    public NextSongMessageDto nextSong(@DestinationVariable String publicId, @Payload NextSongMessageDto message) {
        log.info("Relaying nextSong event for room {}", publicId);
        return message;
    }

    @MessageMapping("/room/{publicId}/requestNextSong")
    public void requestNextSong(
            @DestinationVariable String publicId,
            @Payload NextSongRequestDto request) {
        roomService.advanceToNextSong(publicId, request.getUsername());
    }
}