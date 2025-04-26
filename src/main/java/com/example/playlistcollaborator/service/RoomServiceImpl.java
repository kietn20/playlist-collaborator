// File: src/main/java/com/example/playlistcollaborator/service/RoomServiceImpl.java
// Purpose: Implementation of the RoomService interface.
// Location: src/main/java/com/example/playlistcollaborator/service/

package com.example.playlistcollaborator.service;

import com.example.playlistcollaborator.dto.CreateRoomDto;
import com.example.playlistcollaborator.dto.PlaylistSongDto;
import com.example.playlistcollaborator.dto.RoomDto;
import com.example.playlistcollaborator.entity.PlaylistSong;
import com.example.playlistcollaborator.entity.Room;
import com.example.playlistcollaborator.repository.RoomRepository;
import lombok.RequiredArgsConstructor; // Lombok annotation for constructor injection
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // Important for data consistency

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service // Marks this as a Spring service component
@RequiredArgsConstructor // Creates a constructor with required (final) fields - for dependency injection
public class RoomServiceImpl implements RoomService {

    private final RoomRepository roomRepository; // Inject the repository

    @Override
    @Transactional // Ensures the operation is atomic (all or nothing)
    public RoomDto createRoom(CreateRoomDto createRoomDto) {
        Room newRoom = new Room();
        newRoom.setName(createRoomDto.getName());
        newRoom.setPublicId(generateUniquePublicId()); // Use a helper method

        // Note: PlaylistSongs list is initialized lazily by JPA or explicitly if needed.
        // newRoom.setPlaylistSongs(new ArrayList<>()); // Not strictly needed if cascade is set right

        Room savedRoom = roomRepository.save(newRoom);
        return convertToRoomDto(savedRoom); // Convert entity to DTO
    }

    @Override
    @Transactional(readOnly = true) // Optimization for read operations
    public Optional<RoomDto> findRoomByPublicId(String publicId) {
        return roomRepository.findByPublicId(publicId)
                .map(this::convertToRoomDto); // Convert the found entity to DTO
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
                song.getAddedAt()
        );
    }
}