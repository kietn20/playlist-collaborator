// File: src/main/java/com/example/playlistcollaborator/service/RoomServiceImpl.java
// Purpose: Implementation of the RoomService interface.
// Location: src/main/java/com/example/playlistcollaborator/service/

package com.example.playlistcollaborator.service;

import com.example.playlistcollaborator.dto.AddSongRequest;
import com.example.playlistcollaborator.dto.CreateRoomDto;
import com.example.playlistcollaborator.dto.PlaylistSongDto;
import com.example.playlistcollaborator.dto.RoomDto;
import com.example.playlistcollaborator.entity.PlaylistSong;
import com.example.playlistcollaborator.entity.Room;
import com.example.playlistcollaborator.exception.RoomNotFoundException;
import com.example.playlistcollaborator.repository.PlaylistSongRepository;
import com.example.playlistcollaborator.repository.RoomRepository;
import lombok.RequiredArgsConstructor; // Lombok annotation for constructor injection
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // Important for data consistency

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service // Marks this as a Spring service component
@RequiredArgsConstructor // Creates a constructor with required (final) fields - for dependency injection
@Slf4j
public class RoomServiceImpl implements RoomService {

    private final RoomRepository roomRepository; // Inject the repository
    private final PlaylistSongRepository playlistSongRepository; // Inject PlaylistSongRepository

    @Override
    @Transactional // Ensures the operation is atomic (all or nothing)
    public RoomDto createRoom(CreateRoomDto createRoomDto) {
        log.info("RoomService: createRoom - START");
        Room newRoom = new Room();
        newRoom.setName(createRoomDto.getName());
        newRoom.setPublicId(generateUniquePublicId()); // Use a helper method

        // Note: PlaylistSongs list is initialized lazily by JPA or explicitly if needed.
        // newRoom.setPlaylistSongs(new ArrayList<>()); // Not strictly needed if cascade is set right

        Room savedRoom = roomRepository.save(newRoom);
        log.info("RoomService: createRoom - END, savedRoom.publicId: " + savedRoom.getPublicId());
        return convertToRoomDto(savedRoom); // Convert entity to DTO
    }

    @Override
    @Transactional(readOnly = true) // Optimization for read operations
    public Optional<RoomDto> findRoomByPublicId(String publicId) {
        return roomRepository.findByPublicId(publicId)
                .map(this::convertToRoomDto); // Convert the found entity to DTO
    }

    @Override
    @Transactional // Important: Transaction ensures room lookup and song saving are atomic
    public PlaylistSongDto addSongToRoom(String publicId, AddSongRequest addSongRequest) {
        // 1. Find the Room entity
        log.info("Attempting to add song: {} by {} (user: {}) to room: {}",
                addSongRequest.getTitle(), addSongRequest.getArtist(), addSongRequest.getUsername(), publicId);

        Room room = roomRepository.findByPublicId(publicId)
                .orElseThrow(() -> {
                    log.warn("Room not found with publicId: {} during addSongToRoom", publicId);
                    return new RoomNotFoundException(publicId);
                });

        // 2. Create a new PlaylistSong entity
        PlaylistSong newSong = new PlaylistSong();
        newSong.setTitle(addSongRequest.getTitle());
        newSong.setArtist(addSongRequest.getArtist());
        newSong.setRoom(room);
        newSong.setAddedByUsername(addSongRequest.getUsername());

        // 3. Save the new song (JPA handles setting the ID and @PrePersist fields)
        PlaylistSong savedSong = playlistSongRepository.save(newSong);
        log.info("Song added successfully with ID: {} by user: {}", savedSong.getId(), savedSong.getAddedByUsername());

        // Optional: Explicitly add to the room's collection if needed,
        // though not strictly required for the relationship persistence here.
        // room.getPlaylistSongs().add(savedSong);
        // roomRepository.save(room); // Might trigger update if collection managed bidirectionally

        // 4. Convert the saved song entity to DTO and return it
        return convertToPlaylistSongDto(savedSong);
    }

    // --- Helper Methods ---

    private String generateUniquePublicId() {
        // Simple generation - okay for MVP, might need enhancement for high load
        // Consider adding a retry loop with existsByPublicId check for robustness
        return UUID.randomUUID().toString().substring(0, 8);
        // Example with basic retry (can be improved further):
        // int maxAttempts = 5;
        // for (int i = 0; i < maxAttempts; i++) {
        //     String candidateId = UUID.randomUUID().toString().substring(0, 8);
        //     if (!roomRepository.existsByPublicId(candidateId)) {
        //         return candidateId;
        //     }
        // }
        // throw new RuntimeException("Failed to generate a unique public ID after " + maxAttempts + " attempts");
    }


    // Mapper method to convert Room Entity to RoomDto
    private RoomDto convertToRoomDto(Room room) {
        List<PlaylistSongDto> songDtos;
        // Handle the case where playlistSongs might be null if not fetched/initialized
        // Depending on fetch type and transaction boundaries, explicit loading might be needed
        // E.g., using Hibernate.initialize(room.getPlaylistSongs());
        // or ensuring the fetch happens within the transaction boundary.
        if (room.getPlaylistSongs() != null) {
            songDtos = room.getPlaylistSongs().stream()
                    .map(this::convertToPlaylistSongDto) // Convert each song entity
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
        return new PlaylistSongDto(
                song.getId(),
                song.getTitle(),
                song.getArtist(),
                song.getAddedAt(), // Ensure your DTO constructor has this
                song.getAddedByUsername() // Add username here
        );
    }
}