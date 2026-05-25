package com.exam.socialnetwork.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Set;

@Data
@Builder
public class PostResponseDto {
    private Long id;
    private String title;
    private String content;
    private String imageUrl;
    private UserResponseDto author;
    private Set<String> tags;
    private int commentsCount;
    private int likesCount;
    private boolean likedByCurrentUser;
    private boolean editableByCurrentUser;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
