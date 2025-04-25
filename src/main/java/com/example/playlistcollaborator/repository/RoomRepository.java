package com.example.playlistcollaborator.repository;

import com.example.playlistcollaborator.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface RoomRepository extends JpaRepository<Room, UUID> {

    Optional<Room> findByPublicId(String publicId);

    boolean exisitsByPublicId(String publicId);
}
