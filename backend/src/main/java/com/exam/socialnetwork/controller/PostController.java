package com.exam.socialnetwork.controller;

import com.exam.socialnetwork.dto.PostRequestDto;
import com.exam.socialnetwork.dto.PostResponseDto;
import com.exam.socialnetwork.service.PostService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {
    private final PostService postService;

    @GetMapping
    public Page<PostResponseDto> search(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Long authorId,
            @RequestParam(required = false) String tag,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "6") int size,
            Authentication authentication
    ) {
        return postService.search(q, authorId, tag, dateFrom, dateTo, page, size, authentication);
    }

    @GetMapping("/mine")
    public Page<PostResponseDto> mine(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String tag,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "6") int size,
            Authentication authentication
    ) {
        return postService.searchMine(q, tag, dateFrom, dateTo, page, size, authentication);
    }

    @GetMapping("/{id}")
    public PostResponseDto findById(@PathVariable Long id, Authentication authentication) {
        return postService.findById(id, authentication);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PostResponseDto create(@Valid @RequestBody PostRequestDto request, Authentication authentication) {
        return postService.create(request, authentication);
    }

    @PutMapping("/{id}")
    public PostResponseDto update(@PathVariable Long id, @Valid @RequestBody PostRequestDto request, Authentication authentication) {
        return postService.update(id, request, authentication);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id, Authentication authentication) {
        postService.delete(id, authentication);
    }

    @PostMapping("/{id}/like")
    public PostResponseDto toggleLike(@PathVariable Long id, Authentication authentication) {
        return postService.toggleLike(id, authentication);
    }
}
