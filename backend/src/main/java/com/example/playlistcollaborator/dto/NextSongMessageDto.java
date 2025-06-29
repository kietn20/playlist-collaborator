package com.example.playlistcollaborator.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NextSongMessageDto {
  private String nextSongId;
  private String triggeredBy;
}
