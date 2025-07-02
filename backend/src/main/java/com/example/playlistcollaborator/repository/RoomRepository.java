// Purpose: Spring Data JPA repository interface for Room entities.

package com.example.playlistcollaborator.repository;

import com.example.playlistcollaborator.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository // Marks this as a Spring Data repository component
public interface RoomRepository extends JpaRepository<Room, UUID> { // Entity type: Room, Primary Key type: UUID

    // Spring Data JPA auto implement this method based on the naming convention
    // Finds a Room by its publicId field. Returns Optional to handle cases where it's not found.
    Optional<Room> findByPublicId(String publicId);

    // Optional: Method to check if a publicId already exists
    boolean existsByPublicId(String publicId);
}