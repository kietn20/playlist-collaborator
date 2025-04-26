package com.example.playlistcollaborator.controller;

import com.example.playlistcollaborator.dto.CreateRoomDto;
import com.example.playlistcollaborator.dto.RoomDto;
import com.example.playlistcollaborator.exception.RoomNotFoundException;
import com.example.playlistcollaborator.service.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
public class RoomController {

    private final RoomService roomService;

    @PostMapping
    public ResponseEntity<RoomDto> createRoom(@RequestBody(required = false) CreateRoomDto createRoomDto) {
        CreateRoomDto request = (createRoomDto != null) ? createRoomDto : new CreateRoomDto();
        RoomDto newRoom = roomService.createRoom(request);
        return new ResponseEntity<>(newRoom, HttpStatus.CREATED);
    }

    @GetMapping("/{publicId}")
    public ResponseEntity<RoomDto> getRoomByPublicId(@PathVariable String publicId) {
        return roomService.findRoomByPublicId(publicId).map(ResponseEntity::ok).orElseThrow(() -> new RoomNotFoundException(publicId));

    }
}

