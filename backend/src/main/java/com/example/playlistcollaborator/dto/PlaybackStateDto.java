package com.example.playlistcollaborator.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PlaybackStateDto {
  private boolean isPlaying;
  private double currentTime; // The current time of the video in seconds
  private String videoId; // The ID of the video being controlled
  private String triggeredBy; // The username of the leader who sent the update
  private String eventType; // "sync", "play", "pause", "seek"
}

