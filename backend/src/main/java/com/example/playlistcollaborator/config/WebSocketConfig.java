// File: src/main/java/com/example/playlistcollaborator/config/WebSocketConfig.java
// Purpose: Configures WebSocket messaging with STOMP protocol.
// Location: src/main/java/com/example/playlistcollaborator/config/

package com.example.playlistcollaborator.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker // Enables WebSocket message handling, backed by a message broker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    // Define allowed origins - React dev server and potentially production URL later
    private final String[] ALLOWED_ORIGINS = {
            "http://localhost:3000", // Default Vite/CRA React port
            "http://localhost:5173", // Common Vite dev port
            "http://127.0.0.1:5173" // Another common Vite dev port
            // Add your production frontend URL here when deploying
    };

    /**
     * Registers the STOMP endpoints, mapping each endpoint to a specific URL
     * and enabling SockJS fallback options. SockJS is used to enable
     * WebSocket emulation when WebSocket is not available (e.g., due to proxies).
     * @param registry STOMP endpoint registry
     */
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // The endpoint clients will connect to for WebSocket communication.
        // '/ws-playlist' is the HTTP URL for the WebSocket handshake.
        registry.addEndpoint("/ws-playlist")
                .setAllowedOrigins(ALLOWED_ORIGINS) // Allow connections from REact server
                .withSockJS(); // Enable SockJS fallback options.
        // Optional: .setAllowedOrigins("*") - Configure allowed origins if needed for CORS.
        // By default, same-origin is allowed. For development, you might need "*" or specific origins.
    }

    /**
     * Configures the message broker which will be used to route messages
     * from one client to another.
     * @param registry Message broker registry
     */
    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // 1. Set the application destination prefix. Messages sent from clients
        //    to destinations starting with "/app" will be routed to @MessageMapping
        //    methods in controllers.
        registry.setApplicationDestinationPrefixes("/app");

        // 2. Enable a simple in-memory message broker. Messages whose destination
        //    starts with "/topic" or "/queue" will be routed to the broker.
        //    The broker then broadcasts messages to connected clients subscribing
        //    to specific topics.
        //    - "/topic" is typically used for publish-subscribe (one-to-many)
        //    - "/queue" is typically used for point-to-point messaging (one-to-one, often user-specific)
        registry.enableSimpleBroker("/topic", "/queue");

        // Optional: If you need to send messages to specific users (e.g., using @SendToUser),
        // you might need to configure a user destination prefix.
        // registry.setUserDestinationPrefix("/user");
    }
}