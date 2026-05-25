package com.exam.socialnetwork.controller;

import com.exam.socialnetwork.dto.CommentRequestDto;
import com.exam.socialnetwork.dto.CommentResponseDto;
import com.exam.socialnetwork.service.CommentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class CommentController {
    private final CommentService commentService;


    @GetMapping("/api/comments")
    public Page<CommentResponseDto> search(
            @RequestParam(required = false) Long postId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication
    ) {
        return commentService.search(postId, page, size, authentication);
    }

    @GetMapping("/api/posts/{postId}/comments")
    public Page<CommentResponseDto> findByPost(
            @PathVariable Long postId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication
    ) {
        return commentService.findByPost(postId, page, size, authentication);
    }

    @PostMapping("/api/posts/{postId}/comments")
    @ResponseStatus(HttpStatus.CREATED)
    public CommentResponseDto create(@PathVariable Long postId, @Valid @RequestBody CommentRequestDto request, Authentication authentication) {
        return commentService.create(postId, request, authentication);
    }

    @PutMapping("/api/comments/{id}")
    public CommentResponseDto update(@PathVariable Long id, @Valid @RequestBody CommentRequestDto request, Authentication authentication) {
        return commentService.update(id, request, authentication);
    }

    @DeleteMapping("/api/comments/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id, Authentication authentication) {
        commentService.delete(id, authentication);
    }
}
