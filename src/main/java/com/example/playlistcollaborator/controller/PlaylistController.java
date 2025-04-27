package com.example.playlistcollaborator.controller;

import com.example.playlistcollaborator.dto.AddSongRequest;
import com.example.playlistcollaborator.dto.PlaylistSongDto;
import com.example.playlistcollaborator.service.RoomService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
@Slf4j
public class PlaylistController {

    private final RoomService roomService;

    @MessageMapping("/room/publicId/addSong")
    @SendTo("/topic/room/{publicId}/songs")
    public PlaylistSongDto addSong(@DestinationVariable String publicId, @Payload AddSongRequest request) throws Exception {
        log.info("Received request to add song {} - {} to room {}", request.getTitle(), request.getArtist(), publicId);
        PlaylistSongDto addedSong = roomService.addSongToRoom(publicId, request);
        log.info("Broadcasting added song {} to /topic/room/{}/songs", addedSong.getId(), publicId);
        return addedSong;
    }
}
