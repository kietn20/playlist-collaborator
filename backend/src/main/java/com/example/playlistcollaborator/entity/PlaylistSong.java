// Purpose: JPA Entity representing a Song within a Room's playlist.

package com.example.playlistcollaborator.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "playlist_songs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PlaylistSong {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String artist;

    @Column(name = "added_at", nullable = false, updatable = false)
    private LocalDateTime addedAt;

    // Many-to-one relationship: Many songs belong to one Room
    // FetchType.LAZY: Don't load the Room object unless needed
    // JoinColumn: Specifies the foreign key column in *this* table (playlist_songs)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @Column(name = "youtube_video_id", nullable = true) // Allow null if we support non-YouTube songs later
    private String youtubeVideoId;

    @Column(name = "added_by_username", nullable = true) // Or false if username is always required
    private String addedByUsername;

    @PrePersist
    protected void onAdd() {
        this.addedAt = LocalDateTime.now();
    }
}