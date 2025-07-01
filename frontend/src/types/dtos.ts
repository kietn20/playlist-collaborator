// File: src/types/dtos.ts
// Purpose: Defines TypeScript types for DTOs exchanged with the backend.

export interface PlaylistSongDto {
    id: string; // UUID is a string
    title: string;
    artist: string;
    addedAt: string; // LocalDateTime is serialized as ISO string
    addedByUsername?: string;
    youtubeVideoId?: string;
}

export interface RoomDto {
    publicId: string;
    name: string | null;
    createdAt: string; // LocalDateTime is serialized as ISO string
    playlistSongs: PlaylistSongDto[];
}

export interface CreateRoomDto {
    name?: string | null; 
}

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

export interface NextSongRequestDto {
    username: string;
}