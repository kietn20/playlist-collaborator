// File: src/hooks/usePlaylistWebSocket.ts
// Purpose: Custom hook to manage WebSocket connection and playlist interactions.
// Location: src/hooks/

import { useState, useEffect, useCallback, useRef } from 'react';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { PlaylistSongDto, AddSongWsRequest, SongAddedWsMessage, SongRemovedWsMessage, RemoveSongWsRequest } from '@/types/dtos'; // Adjust path if types are in websocket.ts
import toast from 'react-hot-toast';
import { PlaybackStateDto } from '@/types/dtos';


const WS_ENDPOINT = '/ws-playlist'; // Matches WebSocketConfig.java on backend
// Note: When using Vite proxy, SockJS needs the full path if WS_ENDPOINT starts with '/',
// or we need to construct the base URL correctly.

interface UsePlaylistWebSocketProps {
    roomId: string | null;
    username: string | null;
    isLeader: boolean;
    onPlaylistUpdate: (newSong: PlaylistSongDto) => void;
    onSongRemoved: (removedSongId: string) => void;
    onPlaybackStateUpdate: (newState: PlaybackStateDto) => void;
    onInitialPlaylist: (initialSongs: PlaylistSongDto[]) => void;
}

interface UsePlaylistWebSocketReturn {
    isConnected: boolean;
    sendAddSongMessage: (youtubeVideoId: string, title: string | undefined, artist: string | undefined, username: string) => void;
    sendRemoveSongMessage: (songId: string, /* Optional: username: string */) => void; 
    sendPlaybackState: (state: Omit<PlaybackStateDto, 'triggeredBy'>) => void;
}

export const usePlaylistWebSocket = ({
    roomId,
    username,
    isLeader,
    onPlaylistUpdate,
    onSongRemoved,
    onPlaybackStateUpdate,
    // onInitialPlaylist, // Will be called if we fetch initial state via WS or combined API+WS
}: UsePlaylistWebSocketProps): UsePlaylistWebSocketReturn => {
    const [stompClient, setStompClient] = useState<Client | null>(null);
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const subscriptionRef = useRef<StompSubscription | null>(null);
    const songsSubscriptionRef = useRef<StompSubscription | null>(null); // Rename existing
    const removedSubscriptionRef = useRef<StompSubscription | null>(null); // For songRemoved
    const playbackSubscriptionRef = useRef<StompSubscription | null>(null); // For playbackState


    // Function to determine SockJS URL correctly based on environment
    const getSockJsUrl = () => {
        // If developing and WS_ENDPOINT is absolute like '/ws-playlist',
        // SockJS needs the base URL of the backend.
        // The Vite proxy makes '/api' calls work without base URL, but SockJS is different.
        // If backend is on localhost:8080 and frontend on localhost:5173,
        // SockJS will try to connect to localhost:5173/ws-playlist without this.
        if (import.meta.env.DEV) {
            // Assuming backend is on localhost:8080, and Vite proxy handles API calls.
            // For SockJS, we might need to specify the full backend URL for the handshake.
            // Option 1: Hardcode backend URL for SockJS during dev
            return `http://localhost:8080${WS_ENDPOINT}`;
            // Option 2: Assume proxy handles everything if SockJS endpoint itself is proxied (less common setup)
            // return WS_ENDPOINT;
        }
        // For production, if frontend and backend are same origin:
        return WS_ENDPOINT;
    };


    // --- Connection Logic ---
    useEffect(() => {
        if (roomId && !stompClient) { // Only connect if we have a roomId and no client yet
            console.log(`[WS] Attempting to connect to room: ${roomId}`);
            const client = new Client({
                webSocketFactory: () => new SockJS(getSockJsUrl()),
                // brokerURL: // Not needed when using simple broker with SockJS directly as factory
                connectHeaders: {
                    // login: 'user', // Auth headers if using Spring Security with WebSockets
                    // passcode: 'password',
                },
                debug: (str) => {
                    console.log('[STOMP_DEBUG]', str);
                },
                reconnectDelay: 5000, // Auto-reconnect with 5s delay
                // heartbeatIncoming: 4000, // Example heartbeat
                // heartbeatOutgoing: 4000,
            });

            client.onConnect = (frame) => {
                console.log(`[WS] Connected to Room ${roomId}:`, frame);
                setIsConnected(true);
                toast.success(`Connected to playlist room: ${roomId}`);

                // Subscribe to the room's song topic
                const songsTopic = `/topic/room/${roomId}/songs`;
                console.log(`[WS] Subscribing to ${songsTopic}`);
                subscriptionRef.current = client.subscribe(songsTopic, (message: IMessage) => {
                    try {
                        const newSong = JSON.parse(message.body) as SongAddedWsMessage;
                        console.log('[WS] Received new song:', newSong);
                        toast.success(`"${newSong.title}" added to playlist by ${newSong.artist}!`); // Or by username if available
                        onPlaylistUpdate(newSong); // Update App's state
                    } catch (e) {
                        console.error("[WS] Error parsing message:", e, message.body);
                        toast.error("Received an invalid song update.");
                    }
                });

                // Subscribe to removed songs
                const removedTopic = `/topic/room/${roomId}/songRemoved`;
                console.log(`[WS] Subscribing to ${removedTopic}`);
                removedSubscriptionRef.current = client.subscribe(removedTopic, (message: IMessage) => {
                    try {
                        const removedInfo = JSON.parse(message.body) as SongRemovedWsMessage;
                        console.log('[WS] Received song removed:', removedInfo);
                        toast.success(`A song was removed from the playlist.`);
                        onSongRemoved(removedInfo.songId); // Update App's state
                    } catch (e) {
                        console.error("[WS] Error parsing songRemoved message:", e, message.body);
                    }
                });

                // Subscribe to playback state updates
                const playbackTopic = `/topic/room/${roomId}/playbackState`;
                console.log(`[WS] Subscribing to ${playbackTopic}`);
                playbackSubscriptionRef.current = client.subscribe(playbackTopic, (message: IMessage) => {
                    try {
                        const newState = JSON.parse(message.body) as PlaybackStateDto;
                        // Ignore echoes: if the message was triggered by the current user, don't process it.
                        if (newState.triggeredBy === username) {
                            return;
                        }
                        console.log('[WS] Received playback state update:', newState);
                        onPlaybackStateUpdate(newState); // Notify App/CurrentlyPlaying
                    } catch (e) { 
                        console.error("[WS] Error parsing playbackState message:", e, message.body);
                        toast.error("Received an invalid playback state update.");
                     }
                });

            };

            client.onStompError = (frame) => {
                console.error('[WS] Broker reported error: ' + frame.headers['message']);
                console.error('[WS] Additional details: ' + frame.body);
                toast.error("Playlist connection error: " + frame.headers['message']);
                setIsConnected(false);
            };

            client.onWebSocketError = (event) => {
                console.error("[WS] WebSocket error:", event);
                toast.error("WebSocket connection error. Trying to reconnect...");
                setIsConnected(false); // It will attempt to reconnect based on 'reconnectDelay'
            };
            
            client.onDisconnect = () => {
                console.log("[WS] Disconnected");
                setIsConnected(false);
                // toast.info("Disconnected from playlist room."); // Might be too noisy on intentional disconnects
            };

            client.activate(); // Initiate the connection
            setStompClient(client);
        }

        // --- Disconnection Logic ---
        return () => { // Cleanup
            if (stompClient && stompClient.active) {
                console.log('[WS] Disconnecting...');
                if (songsSubscriptionRef.current) {
                    songsSubscriptionRef.current.unsubscribe();
                    console.log('[WS] Unsubscribed from songs topic.');
                    songsSubscriptionRef.current = null;
                }

                if (removedSubscriptionRef.current) {
                    removedSubscriptionRef.current.unsubscribe();
                    console.log('[WS] Unsubscribed from songRemoved topic.');
                    removedSubscriptionRef.current = null;
                }

                if (playbackSubscriptionRef.current) {
                    playbackSubscriptionRef.current.unsubscribe();
                    playbackSubscriptionRef.current = null;
                }

                stompClient.deactivate() /* ... */;
                setStompClient(null);
                setIsConnected(false);
            }
        };
    }, [roomId, username, onPlaybackStateUpdate, onPlaylistUpdate, onSongRemoved, stompClient]); // Add onSongRemoved to deps

    // --- Sending Messages ---
    const sendAddSongMessage = useCallback((youtubeVideoId: string, title: string | undefined, artist: string | undefined, senderUsername: string) => {
        if (stompClient && stompClient.active && roomId) {
            const destination = `/app/room/${roomId}/addSong`;
            const message: AddSongWsRequest = { youtubeVideoId, title, artist, username: senderUsername }; // Include username
            try {
                stompClient.publish({
                    destination: destination,
                    body: JSON.stringify(message),
                });
                console.log(`[WS] Sent addSong message to ${destination}:`, message);
            } catch (error) {
                console.error("[WS] Error publishing message:", error);
                toast.error("Failed to send song suggestion.");
            }
        } else {
            console.warn('[WS] Cannot send message, client not connected or no room ID.');
            toast.error('Not connected to send song.');
        }
    }, [stompClient, roomId]);

    const sendRemoveSongMessage = useCallback((songId: string /*, senderUsername?: string */) => {
        if (stompClient && stompClient.active && roomId) {
            const destination = `/app/room/${roomId}/removeSong`;
            const message: RemoveSongWsRequest = { songId /*, username: senderUsername */ };
            try {
                stompClient.publish({
                    destination: destination,
                    body: JSON.stringify(message),
                });
                console.log(`[WS] Sent removeSong message to ${destination} for songId: ${songId}`);
            } catch (error) {
                console.error("[WS] Error publishing removeSong message:", error);
                toast.error("Failed to remove song from playlist.");
            }
        } else { 
                console.warn('[WS] Cannot send message, client not connected or no room ID.');
                toast.error('Not connected to remove song.');
        }
    }, [stompClient, roomId]);

    const sendPlaybackState = useCallback((state: Omit<PlaybackStateDto, 'triggeredBy'>) => {
        // Only the leader should send state updates
        if (stompClient && stompClient.active && roomId && isLeader && username) {
            const destination = `/app/room/${roomId}/playbackState`;
            const message: PlaybackStateDto = {
                ...state,
                triggeredBy: username,
            };
            try {
                stompClient.publish({
                    destination: destination,
                    body: JSON.stringify(message),
                });
                // Log only important events, not every sync, to avoid console spam
                if (state.eventType !== 'sync') {
                   console.log(`[WS] Sent playback state event '${state.eventType}' to ${destination}`);
                }
            } catch (error) { 
                console.error("[WS] Error publishing playback state message:", error);
                toast.error("Failed to send playback state update.");
             }
        }
    }, [stompClient, roomId, isLeader, username]);

    return { isConnected, sendAddSongMessage, sendRemoveSongMessage, sendPlaybackState};
};