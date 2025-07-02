// Purpose: REST Controller for Room-related operations.

package com.example.playlistcollaborator.controller;

import com.example.playlistcollaborator.dto.CreateRoomDto;
import com.example.playlistcollaborator.dto.RoomDto;
import com.example.playlistcollaborator.exception.RoomNotFoundException;
import com.example.playlistcollaborator.service.RoomService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController 
@RequestMapping("/api/rooms") 
@RequiredArgsConstructor 
@Slf4j
public class RoomController {

    private final RoomService roomService; 

    /**
     * POST /api/rooms
     * Creates a new collaborative playlist room.
     * @param createRoomDto Request body containing optional room name.
     * @return ResponseEntity containing the details of the created room (RoomDto) and HTTP status 201 (Created).
     */
    @PostMapping
    public ResponseEntity<RoomDto> createRoom(@RequestBody(required = false) CreateRoomDto createRoomDto) {
        log.info("RoomController: createRoom - START"); // Or System.out.println
        CreateRoomDto request = (createRoomDto != null) ? createRoomDto : new CreateRoomDto();
        RoomDto newRoom = roomService.createRoom(request);
        log.info("RoomController: createRoom - END, newRoom.publicId: " + newRoom.getPublicId());
        return new ResponseEntity<>(newRoom, HttpStatus.CREATED);
    }

    /**
     * GET /api/rooms/{publicId}
     * Retrieves the details of a specific room, including its playlist.
     * @param publicId The public identifier of the room from the URL path.
     * @return ResponseEntity containing the RoomDto if found, or throws RoomNotFoundException (handled by @ResponseStatus).
     */
    @GetMapping("/{publicId}")
    public ResponseEntity<RoomDto> getRoomByPublicId(@PathVariable String publicId) {
        return roomService.findRoomByPublicId(publicId)
                .map(ResponseEntity::ok) // If found, return 200 OK with the RoomDto
                .orElseThrow(() -> new RoomNotFoundException(publicId)); // If not found, throw exception (results in 404)

        
    }


}