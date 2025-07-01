// Purpose: Implementation of the RoomService interface.

package com.example.playlistcollaborator.service;

import com.example.playlistcollaborator.dto.AddSongRequest;
import com.example.playlistcollaborator.dto.CreateRoomDto;
import com.example.playlistcollaborator.dto.PlaylistSongDto;
import com.example.playlistcollaborator.dto.RoomDto;
import com.example.playlistcollaborator.dto.SongRemovedResponse;
import com.example.playlistcollaborator.entity.PlaylistSong;
import com.example.playlistcollaborator.entity.Room;
import com.example.playlistcollaborator.exception.PlaylistSongNotFoundException;
import com.example.playlistcollaborator.exception.RoomNotFoundException;
import com.example.playlistcollaborator.repository.PlaylistSongRepository;
import com.example.playlistcollaborator.repository.RoomRepository;
import lombok.RequiredArgsConstructor; 
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; 
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor 
@Slf4j
public class RoomServiceImpl implements RoomService {

    private final RoomRepository roomRepository;
    private final PlaylistSongRepository playlistSongRepository; 
    private final YouTubeApiService youtubeApiService;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    @Transactional 
    public RoomDto createRoom(CreateRoomDto createRoomDto) {
        log.info("RoomService: createRoom - START");
        Room newRoom = new Room();
        newRoom.setName(createRoomDto.getName());
        newRoom.setPublicId(generateUniquePublicId()); 


        Room savedRoom = roomRepository.save(newRoom);
        log.info("RoomService: createRoom - END, savedRoom.publicId: " + savedRoom.getPublicId());
        return convertToRoomDto(savedRoom);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<RoomDto> findRoomByPublicId(String publicId) {
        return roomRepository.findByPublicId(publicId)
                .map(this::convertToRoomDto); 
    }

    @Override
    @Transactional
    public PlaylistSongDto addSongToRoom(String publicId, AddSongRequest addSongRequest) {
        log.info("Attempting to add song: {} by {} (user: {}) to room: {}",
                addSongRequest.getTitle(), addSongRequest.getArtist(), addSongRequest.getUsername(), publicId);

        Room room = roomRepository.findByPublicId(publicId)
                .orElseThrow(() -> {
                    log.warn("Room not found with publicId: {} during addSongToRoom", publicId);
                    return new RoomNotFoundException(publicId);
                });

        PlaylistSong newSong = new PlaylistSong();
        newSong.setYoutubeVideoId(addSongRequest.getYoutubeVideoId());

        String title = addSongRequest.getTitle();
        String artist = addSongRequest.getArtist();

        // Fetch from YouTube if title/artist are missing and videoId is present
        if ((title == null || title.isEmpty() || artist == null || artist.isEmpty()) &&
                addSongRequest.getYoutubeVideoId() != null && !addSongRequest.getYoutubeVideoId().isEmpty()) {
            YouTubeVideoDetails details = youtubeApiService.getVideoDetails(addSongRequest.getYoutubeVideoId());
            if (details != null) {
                title = (title == null || title.isEmpty()) ? details.getTitle() : title;
                artist = (artist == null || artist.isEmpty()) ? details.getChannelTitle() : artist;
            }
        }

        // Set title and artist using fetched data or defaults
        newSong.setTitle((title != null && !title.isEmpty()) ? title : "YouTube Video");
        newSong.setArtist((artist != null && !artist.isEmpty()) ? artist : "Various Artists");

        newSong.setRoom(room);
        newSong.setAddedByUsername(addSongRequest.getUsername());

        PlaylistSong savedSong = playlistSongRepository.save(newSong);
        log.info("Song added successfully with ID: {} by user: {}", savedSong.getId(), savedSong.getAddedByUsername());

        return convertToPlaylistSongDto(savedSong);
    }

    @Override
    @Transactional
    public void removeSongFromRoom(String publicId, UUID songId) {
        log.info("Attempting to remove song ID: {} from room: {}", songId, publicId);

        Room room = roomRepository.findByPublicId(publicId)
                .orElseThrow(() -> {
                    log.warn("Room not found with publicId: {} during removeSongFromRoom", publicId);
                    return new RoomNotFoundException(publicId);
                });

        PlaylistSong songToRemove = room.getPlaylistSongs().stream()
                .filter(song -> song.getId().equals(songId))
                .findFirst()
                .orElseThrow(() -> {
                    log.warn("Song ID: {} not found in room: {} during remove attempt", songId, publicId);
                    return new PlaylistSongNotFoundException(songId, publicId);
                });

        room.getPlaylistSongs().remove(songToRemove);
        roomRepository.save(room); // This will persist the change to the room's song collection

        log.info("Song ID: {} successfully removed from room's collection: {}", songId, publicId);
    }

    @Override
    @Transactional
    public void advanceToNextSong(String publicId, String username) {
        log.info("Received request to advance to next song in room {} from user {}", publicId, username);
        Room room = roomRepository.findByPublicId(publicId).orElseThrow(() -> new RoomNotFoundException(publicId));

        List<PlaylistSong> currentPlaylist = room.getPlaylistSongs();
        if (currentPlaylist.isEmpty()) {
            log.warn("Cannot advance song in room {}: playlist is empty.", publicId);
            return; 
        }

        PlaylistSong finishedSong = currentPlaylist.get(0);
        UUID finishedSongId = finishedSong.getId();

        room.getPlaylistSongs().remove(finishedSong);
        
        PlaylistSong nextSong = currentPlaylist.isEmpty() ? null : currentPlaylist.get(0);

        roomRepository.save(room);

        // --- BROADCAST UPDATES TO ALL CLIENTS ---

        // 1. Tell everyone the old song was removed from the queue.
        // All clients (leader and followers) will listen to this and update their UI.
        String songRemovedTopic = "/topic/room/" + publicId + "/songRemoved";
        messagingTemplate.convertAndSend(songRemovedTopic, new SongRemovedResponse(finishedSongId));
        log.info("Broadcasted songRemoved for songId {} to {}", finishedSongId, songRemovedTopic);
    }

    // --- Helper Methods ---
    private String generateUniquePublicId() {
        return UUID.randomUUID().toString().substring(0, 8);
    }


    // Mapper method to convert Room Entity to RoomDto
    private RoomDto convertToRoomDto(Room room) {
        List<PlaylistSongDto> songDtos;
        if (room.getPlaylistSongs() != null) {
            songDtos = room.getPlaylistSongs().stream()
                    .map(this::convertToPlaylistSongDto)
                    .collect(Collectors.toList());
        } else {
            songDtos = Collections.emptyList();
        }

        return new RoomDto(
                room.getPublicId(),
                room.getName(),
                room.getCreatedAt(),
                songDtos
        );
    }

    // Mapper method to convert PlaylistSong Entity to PlaylistSongDto
    private PlaylistSongDto convertToPlaylistSongDto(PlaylistSong song) {
        log.debug("Converting song to DTO. Video ID from entity: {}", song.getYoutubeVideoId());
        return new PlaylistSongDto(
                song.getId(),
                song.getTitle(),
                song.getArtist(),
                song.getAddedAt(),
                song.getAddedByUsername(),
                song.getYoutubeVideoId()
        );
    }
}