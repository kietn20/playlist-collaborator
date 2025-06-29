// File: src/types/dtos.ts
// Purpose: Defines TypeScript types for DTOs exchanged with the backend.
// Location: src/types/

// Corresponds to PlaylistSongDto.java
export interface PlaylistSongDto {
    id: string; // UUID is a string
    title: string;
    artist: string;
    addedAt: string; // LocalDateTime is serialized as ISO string
    addedByUsername?: string;
    youtubeVideoId?: string;
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
    youtubeVideoId: string;
    title?: string;
    artist?: string;
    username: string;
}

export interface RemoveSongWsRequest {
    songId: string; // Corresponds to UUID on backend
    // username?: string; // Optional
}

export interface SongRemovedWsMessage {
    songId: string; // Corresponds to UUID on backend
}

// Message received from server when a song is added (this is just PlaylistSongDto)
export type SongAddedWsMessage = PlaylistSongDto;

export type PlaybackEventType = 'play' | 'pause' | 'seek' | 'sync';

export interface PlaybackStateDto {
    isPlaying: boolean;
    currentTime: number;
    videoId: string;
    triggeredBy: string; // Username of the leader
    eventType: PlaybackEventType;
}

export interface NextSongWsMessage {
    nextSongId: string | null; // ID of the next song, or null if playlist is empty
    triggeredBy: string;
}