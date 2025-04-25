// File: src/main/java/com/example/playlistcollaborator/entity/Room.java
// Purpose: JPA Entity representing a collaborative playlist Room.
// Location: src/main/java/com/example/playlistcollaborator/entity/

package com.example.playlistcollaborator.entity;

import jakarta.persistence.*;
import lombok.Data; // Lombok annotation for boilerplate code (getters, setters, etc.)
import lombok.NoArgsConstructor; // Lombok for no-args constructor
import lombok.AllArgsConstructor; // Lombok for all-args constructor
import java.time.LocalDateTime;
import java.util.UUID;
import java.util.List;

@Entity
@Table(name = "rooms") // Maps to the 'rooms' table
@Data // Generates getters, setters, equals, hashCode, toString
@NoArgsConstructor
@AllArgsConstructor
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO) // Auto-generate primary key
    private UUID id; // Use UUID for the primary key (universally unique)

    @Column(name = "public_id", unique = true, nullable = false, updatable = false)
    private String publicId; // User-facing unique identifier for the room

    @Column(name = "name", nullable = true) // Room name (optional)
    private String name;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // Establish the one-to-many relationship with PlaylistSong
    // mappedBy="room": Indicates the 'room' field in PlaylistSong owns the relationship
    // cascade=CascadeType.ALL: Operations (persist, remove, etc.) on Room cascade to PlaylistSong
    // orphanRemoval=true: If a PlaylistSong is removed from this list, it's deleted from DB
    // fetch=FetchType.LAZY: PlaylistSongs are not loaded from DB unless explicitly accessed (good practice)
    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("addedAt ASC") // Default order for songs within the room
    private List<PlaylistSong> playlistSongs;

    @PrePersist // Automatically set values before inserting into DB
    protected void onCreate() {
        if (this.publicId == null) {
            // Generate a simple short unique ID (can be improved later)
            this.publicId = UUID.randomUUID().toString().substring(0, 8);
        }
        this.createdAt = LocalDateTime.now();
    }
}