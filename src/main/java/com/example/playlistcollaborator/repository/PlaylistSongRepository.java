package com.example.playlistcollaborator.repository;

import com.example.playlistcollaborator.entity.PlaylistSong;
import org.hibernate.type.descriptor.converter.spi.JpaAttributeConverter;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface PlaylistSongRepository extends JpaAttributeConverter<PlaylistSong, UUID> {

}
