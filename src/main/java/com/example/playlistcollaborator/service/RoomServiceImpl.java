package com.example.playlistcollaborator.service;

import com.example.playlistcollaborator.dto.CreateRoomDto;
import com.example.playlistcollaborator.dto.PlaylistSongDto;
import com.example.playlistcollaborator.dto.RoomDto;
import com.example.playlistcollaborator.entity.PlaylistSong;
import com.example.playlistcollaborator.entity.Room;
import com.example.playlistcollaborator.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoomServiceImpl implements RoomService{

    private final RoomRepository roomRepository;

    @Override
    @Transactional
    public RoomDto createRoom(CreateRoomDto createRoomDto) {
        Room newRoom = new Room();
        newRoom.setName(createRoomDto.getName());
        newRoom.setPublicId(generateUniquePublicId());

        Room savedRoom = roomRepository.save(newRoom);
        return convertToRoomDto(savedRoom);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<RoomDto> findRoomByPublicId(String publicId) {
        return roomRepository.findByPublicId(publicId).map(this::convertToRoomDto);
    }

    // Helper functions
    private String generateUniquePublicId() {
        return UUID.randomUUID().toString().substring(0, 8);
    }

    private RoomDto convertToRoomDto(Room room) {
        List<PlaylistSongDto> songDtos;

        if (room.getPlaylistSongs() != null) {
            songDtos = room.getPlaylistSongs().stream().map(this::convertToPlaylistSongDto).collect(Collectors.toList());
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

    private PlaylistSongDto convertToPlaylistSongDto(PlaylistSong song) {
        return new PlaylistSongDto(
                song.getId(),
                song.getTitle(),
                song.getArtist(),
                song.getAddedAt()
        );
    }
}
