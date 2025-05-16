// File: src/hooks/usePlaylistWebSocket.ts
// Purpose: Custom hook to manage WebSocket connection and playlist interactions.
// Location: src/hooks/

import { useState, useEffect, useCallback, useRef } from 'react';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { PlaylistSongDto, AddSongWsRequest, SongAddedWsMessage } from '@/types/dtos'; // Adjust path if types are in websocket.ts
import toast from 'react-hot-toast';

const WS_ENDPOINT = '/ws-playlist'; // Matches WebSocketConfig.java on backend
// Note: When using Vite proxy, SockJS needs the full path if WS_ENDPOINT starts with '/',
// or we need to construct the base URL correctly.

interface UsePlaylistWebSocketProps {
    roomId: string | null;
    username: string | null; // For attributing added songs or other user-specific actions
    onPlaylistUpdate: (newSong: PlaylistSongDto) => void; // Callback to update local playlist state
    onInitialPlaylist: (initialSongs: PlaylistSongDto[]) => void; // Callback to set the initial playlist
}

interface UsePlaylistWebSocketReturn {
    isConnected: boolean;
    sendAddSongMessage: (title: string, artist: string) => void;
    // Add other send functions later (removeSong, etc.)
}

export const usePlaylistWebSocket = ({
    roomId,
    username, // Currently unused in send, but good to have
    onPlaylistUpdate,
    onInitialPlaylist, // Will be called if we fetch initial state via WS or combined API+WS
}: UsePlaylistWebSocketProps): UsePlaylistWebSocketReturn => {
    const [stompClient, setStompClient] = useState<Client | null>(null);
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const subscriptionRef = useRef<StompSubscription | null>(null);

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
                const topic = `/topic/room/${roomId}/songs`;
                console.log(`[WS] Subscribing to ${topic}`);
                subscriptionRef.current = client.subscribe(topic, (message: IMessage) => {
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

                // Potentially, we could fetch initial playlist via a WS message too
                // client.publish({ destination: `/app/room/${roomId}/getInitialPlaylist` });
                // and handle its response, instead of relying solely on REST for initial load.
                // For now, initial playlist is via REST call in App.tsx.
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
        return () => {
            if (stompClient && stompClient.active) { // stompClient.active is better check
                console.log('[WS] Disconnecting...');
                if (subscriptionRef.current) {
                    subscriptionRef.current.unsubscribe();
                    console.log('[WS] Unsubscribed from topic.');
                    subscriptionRef.current = null;
                }
                stompClient.deactivate()
                    .then(() => console.log('[WS] Deactivated successfully.'))
                    .catch(err => console.error('[WS] Error during deactivation:', err));
                setStompClient(null); // Clear the client to allow reconnect if roomId changes
                setIsConnected(false);
            }
        };
    }, [roomId, onPlaylistUpdate, stompClient]); // Rerun if roomId changes

    // --- Sending Messages ---
    const sendAddSongMessage = useCallback((title: string, artist: string) => {
        if (stompClient && stompClient.active && roomId) {
            const destination = `/app/room/${roomId}/addSong`;
            const message: AddSongWsRequest = { title, artist };
            try {
                stompClient.publish({
                    destination: destination,
                    body: JSON.stringify(message),
                });
                console.log(`[WS] Sent addSong message to ${destination}:`, message);
                // Toast for sending is optional, success usually comes from receiving own message back
            } catch (error) {
                console.error("[WS] Error publishing message:", error);
                toast.error("Failed to send song suggestion.");
            }
        } else {
            console.warn('[WS] Cannot send message, client not connected or no room ID.');
            toast.error('Not connected to send song.');
        }
    }, [stompClient, roomId]);


    return { isConnected, sendAddSongMessage };
};