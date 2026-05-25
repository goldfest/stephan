package com.exam.socialnetwork.service;

import com.exam.socialnetwork.dto.CommentRequestDto;
import com.exam.socialnetwork.dto.CommentResponseDto;
import com.exam.socialnetwork.entity.CommentEntity;
import com.exam.socialnetwork.entity.PostEntity;
import com.exam.socialnetwork.entity.UserEntity;
import com.exam.socialnetwork.enums.Role;
import com.exam.socialnetwork.repository.CommentRepository;
import com.exam.socialnetwork.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
@RequiredArgsConstructor
public class CommentService {
    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final UserService userService;

    @Transactional(readOnly = true)
    public Page<CommentResponseDto> findByPost(Long postId, int page, int size, Authentication authentication) {
        if (!postRepository.existsById(postId)) {
            throw new ResponseStatusException(NOT_FOUND, "Пост не найден");
        }
        UserEntity currentUser = userService.getCurrentUser(authentication);
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 50), Sort.by(Sort.Direction.ASC, "createdAt"));
        return commentRepository.findByPostId(postId, pageable)
                .map(comment -> toDto(comment, currentUser));
    }

    @Transactional(readOnly = true)
    public Page<CommentResponseDto> search(Long postId, int page, int size, Authentication authentication) {
        UserEntity currentUser = userService.getCurrentUser(authentication);
        Pageable pageable = PageRequest.of(
                Math.max(page, 0),
                Math.min(Math.max(size, 1), 50),
                Sort.by(Sort.Direction.DESC, "createdAt")
        );

        if (postId != null) {
            if (!postRepository.existsById(postId)) {
                throw new ResponseStatusException(NOT_FOUND, "Пост не найден");
            }

            return commentRepository.findByPostId(postId, pageable)
                    .map(comment -> toDto(comment, currentUser));
        }

        return commentRepository.findAll(pageable)
                .map(comment -> toDto(comment, currentUser));
    }

    @Transactional
    public CommentResponseDto create(Long postId, CommentRequestDto request, Authentication authentication) {
        UserEntity currentUser = userService.getCurrentUser(authentication);
        PostEntity post = postRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Пост не найден"));

        CommentEntity comment = CommentEntity.builder()
                .text(request.getText().trim())
                .post(post)
                .author(currentUser)
                .build();
        return toDto(commentRepository.save(comment), currentUser);
    }

    @Transactional
    public CommentResponseDto update(Long id, CommentRequestDto request, Authentication authentication) {
        UserEntity currentUser = userService.getCurrentUser(authentication);
        CommentEntity comment = findComment(id);
        assertEditable(comment, currentUser);
        comment.setText(request.getText().trim());
        return toDto(commentRepository.save(comment), currentUser);
    }

    @Transactional
    public void delete(Long id, Authentication authentication) {
        UserEntity currentUser = userService.getCurrentUser(authentication);
        CommentEntity comment = findComment(id);
        assertEditable(comment, currentUser);
        commentRepository.delete(comment);
    }

    private CommentEntity findComment(Long id) {
        return commentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Комментарий не найден"));
    }

    private void assertEditable(CommentEntity comment, UserEntity currentUser) {
        if (!comment.getAuthor().getId().equals(currentUser.getId()) && currentUser.getRole() != Role.ADMIN) {
            throw new AccessDeniedException("Можно изменять только свои комментарии");
        }
    }

    public CommentResponseDto toDto(CommentEntity comment, UserEntity currentUser) {
        boolean editable = currentUser != null && (comment.getAuthor().getId().equals(currentUser.getId()) || currentUser.getRole() == Role.ADMIN);
        return CommentResponseDto.builder()
                .id(comment.getId())
                .text(comment.getText())
                .postId(comment.getPost().getId())
                .postTitle(comment.getPost().getTitle())
                .author(userService.toDto(comment.getAuthor()))
                .editableByCurrentUser(editable)
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .build();
    }
}
