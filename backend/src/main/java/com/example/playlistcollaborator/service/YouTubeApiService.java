// File: src/main/java/com/example/playlistcollaborator/service/YouTubeApiService.java
package com.example.playlistcollaborator.service;

import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.jackson2.JacksonFactory;
import com.google.api.services.youtube.YouTube;
import com.google.api.services.youtube.model.Video;
import com.google.api.services.youtube.model.VideoListResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Collections;
import java.util.List;

// Simple DTO for returning details
class YouTubeVideoDetails {
  private String title;
  private String channelTitle; // Artist

  public YouTubeVideoDetails(String title, String channelTitle) {
    this.title = title;
    this.channelTitle = channelTitle;
  }

  public String getTitle() {
    return title;
  }

  public String getChannelTitle() {
    return channelTitle;
  }
}

@Service
@Slf4j
public class YouTubeApiService {

  @Value("${youtube.apikey}")
  private String apiKey;

  private static final String APPLICATION_NAME = "PlaylistCollaborator";
  private final YouTube youtubeService;

  public YouTubeApiService() throws GeneralSecurityException, IOException {
    this.youtubeService = new YouTube.Builder(
        GoogleNetHttpTransport.newTrustedTransport(),
        JacksonFactory.getDefaultInstance(),
        null // HttpRequestInitializer - not needed for API key auth
    ).setApplicationName(APPLICATION_NAME).build();
  }

  public YouTubeVideoDetails getVideoDetails(String videoId) {
    if (videoId == null || videoId.trim().isEmpty()) {
      log.warn("Attempted to get video details for null or empty videoId.");
      return null;
    }
    try {
      YouTube.Videos.List request = youtubeService.videos()
          .list(Collections.singletonList("snippet")); // Parts to retrieve
      request.setKey(apiKey);
      request.setId(Collections.singletonList(videoId));

      VideoListResponse response = request.execute();
      List<Video> videos = response.getItems();

      if (videos != null && !videos.isEmpty()) {
        Video video = videos.get(0);
        String title = video.getSnippet().getTitle();
        String channelTitle = video.getSnippet().getChannelTitle();
        log.info("Fetched YouTube details for videoId {}: Title='{}', Channel='{}'", videoId, title, channelTitle);
        return new YouTubeVideoDetails(title, channelTitle);
      } else {
        log.warn("No video details found for videoId: {}", videoId);
        return null;
      }
    } catch (IOException e) {
      log.error("IOException while fetching video details for {}: {}", videoId, e.getMessage());
      // Consider specific exception handling or rethrowing custom exception
      return null;
    }
  }
}