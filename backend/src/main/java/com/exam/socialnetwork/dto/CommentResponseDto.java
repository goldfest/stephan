package com.exam.socialnetwork.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class CommentResponseDto {
    private Long id;
    private String text;
    private Long postId;
    private String postTitle;
    private UserResponseDto author;
    private boolean editableByCurrentUser;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
