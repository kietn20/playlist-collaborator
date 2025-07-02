// Purpose: Spring Data JPA repository interface for PlaylistSong entities.

package com.example.playlistcollaborator.repository;

import com.example.playlistcollaborator.entity.PlaylistSong;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PlaylistSongRepository extends JpaRepository<PlaylistSong, UUID> { // Entity: PlaylistSong, PK: UUID

}