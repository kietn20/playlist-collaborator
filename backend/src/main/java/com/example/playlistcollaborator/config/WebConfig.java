// File: backend/src/main/java/com/example/playlistcollaborator/config/WebConfig.java
// Purpose: Global CORS configuration for REST endpoints.
// Location: backend/src/main/java/com/example/playlistcollaborator/config/

package com.example.playlistcollaborator.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@EnableWebMvc
public class WebConfig implements WebMvcConfigurer {

    // Use the same origins defined in WebSocketConfig for consistency
    private final String[] ALLOWED_ORIGINS = {
            "http://localhost:3000",
            "http://localhost:5173",
            "http://127.0.0.1:5173"
            // Add your production frontend URL here when deploying
    };

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**") // Apply CORS to your API endpoints
                .allowedOrigins(ALLOWED_ORIGINS)
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // Methods your API uses
                .allowedHeaders("*") // Allow all standard headers
                .allowCredentials(false); // Set to true if you need cookies/auth headers, but often false for simple APIs
    }
}