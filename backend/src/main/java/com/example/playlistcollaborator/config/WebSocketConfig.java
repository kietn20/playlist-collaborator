// Purpose: Configures WebSocket messaging with STOMP protocol.

package com.example.playlistcollaborator.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;
import org.springframework.context.annotation.Bean;

@Configuration
@EnableWebSocketMessageBroker
@EnableScheduling
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    // Define allowed origins - React dev server and potentially production URL
    private final String[] ALLOWED_ORIGINS = {
            "http://localhost:3000",
            "http://localhost:5173",
            "http://127.0.0.1:5173"
    };

    /**
     * Registers the STOMP endpoints, mapping each endpoint to a specific URL
     * and enabling SockJS fallback options. SockJS is used to enable
     * WebSocket emulation when WebSocket is not available (e.g., due to proxies).
     * 
     * @param registry STOMP endpoint registry
     */
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // The endpoint clients will connect to for WebSocket communication.
        // '/ws-playlist' is the HTTP URL for the WebSocket handshake.
        registry.addEndpoint("/ws-playlist")
                .setAllowedOrigins(ALLOWED_ORIGINS) // Allow connections from REact server
                .withSockJS(); // Enable SockJS fallback options.
    }

    /**
     * Configures the message broker which will be used to route messages
     * from one client to another.
     * 
     * @param registry Message broker registry
     */
    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // 1. Set the application destination prefix. Messages sent from clients
        // to destinations starting with "/app" will be routed to @MessageMapping
        // methods in controllers.
        registry.setApplicationDestinationPrefixes("/app");

        // 2. Enable a simple in-memory message broker. Messages whose destination
        // starts with "/topic" or "/queue" will be routed to the broker.
        // The broker then broadcasts messages to connected clients subscribing
        // to specific topics.
        // - "/topic" is typically used for publish-subscribe (one-to-many)
        // - "/queue" is typically used for point-to-point messaging (one-to-one, often
        // user-specific)
        registry.enableSimpleBroker("/topic", "/queue")
                .setHeartbeatValue(new long[] { 10000, 10000 })
                .setTaskScheduler(heartBeatTaskScheduler());
    }

    @Bean
    public ThreadPoolTaskScheduler heartBeatTaskScheduler() {
        ThreadPoolTaskScheduler taskScheduler = new ThreadPoolTaskScheduler();
        taskScheduler.setPoolSize(1);
        taskScheduler.setThreadNamePrefix("wss-heartbeat-");
        taskScheduler.initialize();
        return taskScheduler;
    }
}