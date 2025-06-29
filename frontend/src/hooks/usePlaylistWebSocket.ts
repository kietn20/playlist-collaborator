// File: frontend/src/hooks/usePlaylistWebSocket.ts (Corrected)

import { useState, useEffect, useCallback, useRef } from 'react';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { PlaylistSongDto, AddSongWsRequest, SongAddedWsMessage, SongRemovedWsMessage, NextSongWsMessage, PlaybackStateDto } from '@/types/dtos';
import toast from 'react-hot-toast';

const WS_ENDPOINT = '/ws-playlist';

interface UsePlaylistWebSocketProps {
    roomId: string | null;
    username: string | null;
    isLeader: boolean;
    onPlaylistUpdate: (newSong: PlaylistSongDto) => void;
    onSongRemoved: (removedSongId: string) => void;
    onPlaybackStateUpdate: (newState: PlaybackStateDto) => void;
    onNextSong: (message: NextSongWsMessage) => void;
}

interface UsePlaylistWebSocketReturn {
    isConnected: boolean;
    sendAddSongMessage: (youtubeVideoId: string, title: string | undefined, artist: string | undefined, username: string) => void;
    sendRemoveSongMessage: (songId: string) => void;
    sendPlaybackState: (state: Omit<PlaybackStateDto, 'triggeredBy'>) => void;
    sendNextSongEvent: (nextSongId: string | null) => void;
}

export const usePlaylistWebSocket = ({
    roomId,
    username,
    isLeader,
    onPlaylistUpdate,
    onSongRemoved,
    onPlaybackStateUpdate,
    onNextSong,
}: UsePlaylistWebSocketProps): UsePlaylistWebSocketReturn => {
    const [stompClient, setStompClient] = useState<Client | null>(null);
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const subscriptionsRef = useRef<StompSubscription[]>([]);

    const getSockJsUrl = () => {
        if (import.meta.env.DEV) {
            return `http://localhost:8080${WS_ENDPOINT}`;
        }
        return WS_ENDPOINT;
    };

    useEffect(() => {
        if (roomId && username && !stompClient) {
            console.log(`[WS] Attempting to connect to room: ${roomId}`);
            const client = new Client({
                webSocketFactory: () => new SockJS(getSockJsUrl()),
                debug: (str) => { console.log('[STOMP_DEBUG]', str); },
                reconnectDelay: 5000,
            });

            client.onConnect = (frame) => {
                console.log(`[WS] Connected to Room ${roomId}:`, frame);
                setIsConnected(true);
                toast.success(`Connected to room: ${roomId}`);

                const newSubscriptions: StompSubscription[] = [];

                newSubscriptions.push(client.subscribe(`/topic/room/${roomId}/songs`, (message: IMessage) => {
                    try {
                        const newSong = JSON.parse(message.body) as SongAddedWsMessage;
                        console.log('[WS] Received new song:', newSong);
                        toast.success(`"${newSong.title}" added to playlist!`);
                        onPlaylistUpdate(newSong);
                    } catch (e) { console.error("[WS] Error parsing songAdded message:", e); }
                }));

                newSubscriptions.push(client.subscribe(`/topic/room/${roomId}/songRemoved`, (message: IMessage) => {
                    try {
                        const removedInfo = JSON.parse(message.body) as SongRemovedWsMessage;
                        console.log('[WS] Received song removed:', removedInfo);
                        toast(`A song was removed from the playlist.`);
                        onSongRemoved(removedInfo.songId);
                    } catch (e) { console.error("[WS] Error parsing songRemoved message:", e); }
                }));

                newSubscriptions.push(client.subscribe(`/topic/room/${roomId}/playbackState`, (message: IMessage) => {
                    try {
                        const newState = JSON.parse(message.body) as PlaybackStateDto;
                        if (newState.triggeredBy === username) return; // Ignore echo
                        console.log('[WS] Received playback state update:', newState);
                        onPlaybackStateUpdate(newState);
                    } catch (e) { console.error("[WS] Error parsing playbackState message:", e); }
                }));

                newSubscriptions.push(client.subscribe(`/topic/room/${roomId}/nextSong`, (message: IMessage) => {
                    try {
                        const nextSongMessage = JSON.parse(message.body) as NextSongWsMessage;
                        onNextSong(nextSongMessage);
                    } catch (e) { console.error("[WS] Error parsing nextSong message:", e); }
                }));

                subscriptionsRef.current = newSubscriptions;
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

            client.activate();
            setStompClient(client);
        }

        return () => { // Cleanup Logic
            if (stompClient?.active) {
                console.log('[WS] Disconnecting...');
                subscriptionsRef.current.forEach(sub => sub.unsubscribe());
                subscriptionsRef.current = [];
                stompClient.deactivate();
                setStompClient(null);
                setIsConnected(false);
            }
        };
    }, [roomId, username, onNextSong, onPlaybackStateUpdate, onPlaylistUpdate, onSongRemoved]);

    const sendAddSongMessage = useCallback((youtubeVideoId: string, title: string | undefined, artist: string | undefined, senderUsername: string) => {
        if (stompClient?.active && roomId) {
            const message: AddSongWsRequest = { youtubeVideoId, title, artist, username: senderUsername };
            stompClient.publish({ destination: `/app/room/${roomId}/addSong`, body: JSON.stringify(message) });
        }
    }, [stompClient, roomId]);

    const sendRemoveSongMessage = useCallback((songId: string) => {
        if (stompClient?.active && roomId) {
            stompClient.publish({ destination: `/app/room/${roomId}/removeSong`, body: JSON.stringify({ songId }) });
        }
    }, [stompClient, roomId]);

    const sendPlaybackState = useCallback((state: Omit<PlaybackStateDto, 'triggeredBy'>) => {
        if (stompClient?.active && roomId && isLeader && username) {
            const message: PlaybackStateDto = { ...state, triggeredBy: username };
            stompClient.publish({ destination: `/app/room/${roomId}/playbackState`, body: JSON.stringify(message) });
            if (state.eventType !== 'sync') {
                console.log(`[WS] Sent playback state event '${state.eventType}'`);
            }
        }
    }, [stompClient, roomId, isLeader, username]);

    const sendNextSongEvent = useCallback((nextSongId: string | null) => {
        if (stompClient?.active && roomId && username) {
            const message: NextSongWsMessage = { nextSongId, triggeredBy: username };
            stompClient.publish({ destination: `/app/room/${roomId}/nextSong`, body: JSON.stringify(message) });
            console.log('[WS] Sent nextSong event');
        }
    }, [stompClient, roomId, username]);

    return { isConnected, sendAddSongMessage, sendRemoveSongMessage, sendPlaybackState, sendNextSongEvent };
};