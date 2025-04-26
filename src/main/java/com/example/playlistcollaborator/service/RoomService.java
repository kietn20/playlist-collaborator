package com.example.playlistcollaborator.service;

import com.example.playlistcollaborator.dto.CreateRoomDto;
import com.example.playlistcollaborator.dto.RoomDto;

import java.util.Optional;

public interface RoomService {

    RoomDto createRoom(CreateRoomDto createRoomDto);

    Optional<RoomDto> findRoomByPublicId(String publicId);
}
