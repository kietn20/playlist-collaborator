// File (Backend): src/main/java/com/example/playlistcollaborator/config/SecurityConfig.java
package com.example.playlistcollaborator.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer; // For new lambda DSL
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.Arrays;
import org.springframework.http.HttpMethod; // Import HttpMethod


@Configuration
@EnableWebSecurity
public class SecurityConfig {

//    @Bean
//    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
//        http
//                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
//                .authorizeHttpRequests(authorizeRequests ->
//                        authorizeRequests
//                                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll() // Allow all OPTIONS pre-flight requests
//                                .requestMatchers(HttpMethod.POST, "/api/rooms").permitAll() // Specifically permit POST to /api/rooms
//                                .requestMatchers(HttpMethod.GET, "/api/rooms/**").permitAll() // Specifically permit GET to /api/rooms/{publicId} and potentially others under /rooms
//                                .requestMatchers("/ws-playlist/**").permitAll()
//                                .requestMatchers("/api/**").authenticated() // Secure other /api/** by default if not matched above (change to permitAll() if needed)
//                                .anyRequest().authenticated() // All other requests require authentication
//                )
//                .csrf(AbstractHttpConfigurer::disable);
//        return http.build();
//    }
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(authorizeRequests ->
                        authorizeRequests
                                // Specific permits first
                                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                                .requestMatchers(HttpMethod.POST, "/api/rooms").permitAll()
                                .requestMatchers(HttpMethod.GET, "/api/rooms/{publicId}").permitAll() // More specific for the GET
                                .requestMatchers("/ws-playlist/**").permitAll()
                                // Then, a broader permit for other /api GETs if needed, or more specific rules
                                // .requestMatchers(HttpMethod.GET, "/api/**").permitAll() // If you have other general GET APIs

                                .requestMatchers("/error").permitAll()

                                // Catch-all for other /api paths that weren't explicitly permitted above
                                .requestMatchers("/api/**").authenticated()
                                // All other non-API requests
                                .anyRequest().authenticated()
                )
                .csrf(AbstractHttpConfigurer::disable);
        return http.build();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // configuration.setAllowedOrigins(Arrays.asList("http://localhost:5173")); // Your Vite dev server
        configuration.setAllowedOrigins(Arrays.asList(
                "http://localhost:5173",
                "http://localhost:5174",
                "http://localhost:5175",
                "http://localhost:5176",
                "http://localhost:5177"
                // Add more if needed
        ));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*")); // Allow all headers
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration); // Apply to all paths
        return source;
    }
}