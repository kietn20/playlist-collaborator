// File: src/types/dtos.ts
// Purpose: Defines TypeScript types for DTOs exchanged with the backend.
// Location: src/types/

// Corresponds to PlaylistSongDto.java
export interface PlaylistSongDto {
    id: string; // UUID is a string
    title: string;
    artist: string;
    addedAt: string; // LocalDateTime is serialized as ISO string
    // addedBy?: string; // We might add this later via WebSocket payload or enriched DTO
}

// Corresponds to RoomDto.java
export interface RoomDto {
    publicId: string;
    name: string | null; // name is nullable
    createdAt: string; // LocalDateTime is serialized as ISO string
    playlistSongs: PlaylistSongDto[];
}

// Corresponds to CreateRoomDto.java
export interface CreateRoomDto {
    name?: string | null; // Optional name
}

// Could add specific response types if needed
export interface ApiError {
    timestamp: string;
    status: number;
    error: string;
    message: string;
    path: string;
}

export interface AddSongWsRequest {
    title: string;
    artist: string;
    // username?: string; // Server can potentially derive this if users are authenticated
}

// Message received from server when a song is added (this is just PlaylistSongDto)
export type SongAddedWsMessage = PlaylistSongDto;