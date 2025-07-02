// Purpose: JPA Entity representing a collaborative playlist Room.

package com.example.playlistcollaborator.entity;

import jakarta.persistence.*;
import lombok.Data; 
import lombok.NoArgsConstructor; 
import lombok.AllArgsConstructor; 
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

    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("addedAt ASC")
    private List<PlaylistSong> playlistSongs;

    @PrePersist // Automatically set values before inserting into DB
    protected void onCreate() {
        if (this.publicId == null) {
            this.publicId = UUID.randomUUID().toString().substring(0, 8);
        }
        this.createdAt = LocalDateTime.now();
    }
}