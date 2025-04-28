// File: src/main/java/com/example/playlistcollaborator/repository/PlaylistSongRepository.java
// Purpose: Spring Data JPA repository interface for PlaylistSong entities.
// Location: src/main/java/com/example/playlistcollaborator/repository/

package com.example.playlistcollaborator.repository;

import com.example.playlistcollaborator.entity.PlaylistSong;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PlaylistSongRepository extends JpaRepository<PlaylistSong, UUID> { // Entity: PlaylistSong, PK: UUID

    // Potential custom query if needed later, for example:
    // List<PlaylistSong> findByRoomIdOrderByAddedAtAsc(UUID roomId);
    // However, the @OrderBy in the Room entity might cover the default ordering case.
}