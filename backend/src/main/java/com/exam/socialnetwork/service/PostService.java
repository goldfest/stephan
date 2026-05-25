package com.exam.socialnetwork.service;

import com.exam.socialnetwork.dto.PostRequestDto;
import com.exam.socialnetwork.dto.PostResponseDto;
import com.exam.socialnetwork.dto.UserResponseDto;
import com.exam.socialnetwork.entity.LikeEntity;
import com.exam.socialnetwork.entity.PostEntity;
import com.exam.socialnetwork.entity.TagEntity;
import com.exam.socialnetwork.entity.UserEntity;
import com.exam.socialnetwork.enums.Role;
import com.exam.socialnetwork.repository.LikeRepository;
import com.exam.socialnetwork.repository.PostRepository;
import com.exam.socialnetwork.repository.TagRepository;
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
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.LinkedHashSet;
import java.util.Set;
import java.util.stream.Collectors;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
@RequiredArgsConstructor
public class PostService {
    private final PostRepository postRepository;
    private final TagRepository tagRepository;
    private final LikeRepository likeRepository;
    private final UserService userService;

    @Transactional(readOnly = true)
    public Page<PostResponseDto> search(String query,
                                        Long authorId,
                                        String tag,
                                        LocalDate dateFrom,
                                        LocalDate dateTo,
                                        int page,
                                        int size,
                                        Authentication authentication) {
        UserEntity currentUser = userService.getCurrentUser(authentication);
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 50), Sort.by(Sort.Direction.DESC, "createdAt"));
        LocalDateTime from = dateFrom == null ? null : dateFrom.atStartOfDay();
        LocalDateTime to = dateTo == null ? null : dateTo.atTime(LocalTime.MAX);

        return postRepository.findAll(
                        buildPostSpecification(normalizeQuery(query), authorId, normalizeTagFilter(tag), from, to),
                        pageable
                )
                .map(post -> toDto(post, currentUser));
    }

    @Transactional(readOnly = true)
    public Page<PostResponseDto> searchMine(String query,
                                            String tag,
                                            LocalDate dateFrom,
                                            LocalDate dateTo,
                                            int page,
                                            int size,
                                            Authentication authentication) {
        UserEntity currentUser = userService.getCurrentUser(authentication);
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 50), Sort.by(Sort.Direction.DESC, "createdAt"));
        LocalDateTime from = dateFrom == null ? null : dateFrom.atStartOfDay();
        LocalDateTime to = dateTo == null ? null : dateTo.atTime(LocalTime.MAX);

        return postRepository.findAll(
                        buildPostSpecification(normalizeQuery(query), currentUser.getId(), normalizeTagFilter(tag), from, to),
                        pageable
                )
                .map(post -> toDto(post, currentUser));
    }

    @Transactional(readOnly = true)
    public PostResponseDto findById(Long id, Authentication authentication) {
        UserEntity currentUser = userService.getCurrentUser(authentication);
        return toDto(findPost(id), currentUser);
    }

    @Transactional
    public PostResponseDto create(PostRequestDto request, Authentication authentication) {
        UserEntity currentUser = userService.getCurrentUser(authentication);
        PostEntity post = PostEntity.builder()
                .title(request.getTitle().trim())
                .content(request.getContent().trim())
                .imageUrl(cleanNullable(request.getImageUrl()))
                .author(currentUser)
                .tags(resolveTags(request.getTags()))
                .build();
        return toDto(postRepository.save(post), currentUser);
    }

    @Transactional
    public PostResponseDto update(Long id, PostRequestDto request, Authentication authentication) {
        UserEntity currentUser = userService.getCurrentUser(authentication);
        PostEntity post = findPost(id);
        assertPostEditable(post, currentUser);

        post.setTitle(request.getTitle().trim());
        post.setContent(request.getContent().trim());
        post.setImageUrl(cleanNullable(request.getImageUrl()));
        post.getTags().clear();
        post.getTags().addAll(resolveTags(request.getTags()));

        return toDto(postRepository.save(post), currentUser);
    }

    @Transactional
    public void delete(Long id, Authentication authentication) {
        UserEntity currentUser = userService.getCurrentUser(authentication);
        PostEntity post = findPost(id);
        assertPostEditable(post, currentUser);
        postRepository.delete(post);
    }

    @Transactional
    public PostResponseDto toggleLike(Long id, Authentication authentication) {
        UserEntity currentUser = userService.getCurrentUser(authentication);
        PostEntity post = findPost(id);

        likeRepository.findByUserIdAndPostId(currentUser.getId(), post.getId())
                .ifPresentOrElse(
                        likeRepository::delete,
                        () -> likeRepository.save(LikeEntity.builder().user(currentUser).post(post).build())
                );
        postRepository.flush();
        return toDto(findPost(id), currentUser);
    }

    private Specification<PostEntity> buildPostSpecification(String query,
                                                             Long authorId,
                                                             String tag,
                                                             LocalDateTime from,
                                                             LocalDateTime to) {
        return (root, criteriaQuery, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (authorId != null) {
                predicates.add(criteriaBuilder.equal(root.get("author").get("id"), authorId));
            }

            if (query != null && !query.isBlank()) {
                String pattern = "%" + query.toLowerCase() + "%";

                predicates.add(criteriaBuilder.or(
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("title")), pattern),
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("content")), pattern)
                ));
            }

            if (tag != null && !tag.isBlank()) {
                Join<Object, Object> tagJoin = root.join("tags", JoinType.LEFT);

                predicates.add(criteriaBuilder.equal(
                        criteriaBuilder.lower(tagJoin.get("name")),
                        tag.toLowerCase()
                ));

                criteriaQuery.distinct(true);
            }

            if (from != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("createdAt"), from));
            }

            if (to != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("createdAt"), to));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }

    private PostEntity findPost(Long id) {
        return postRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Пост не найден"));
    }

    private void assertPostEditable(PostEntity post, UserEntity currentUser) {
        if (!post.getAuthor().getId().equals(currentUser.getId()) && currentUser.getRole() != Role.ADMIN) {
            throw new AccessDeniedException("Можно изменять только свои посты");
        }
    }

    private Set<TagEntity> resolveTags(Set<String> tagNames) {
        if (tagNames == null) {
            return new LinkedHashSet<>();
        }

        return tagNames.stream()
                .map(this::normalizeTag)
                .filter(tag -> !tag.isBlank())
                .distinct()
                .limit(8)
                .map(name -> tagRepository.findByNameIgnoreCase(name)
                        .orElseGet(() -> tagRepository.save(TagEntity.builder().name(name).build())))
                .collect(Collectors.toCollection(LinkedHashSet::new));
    }

    private String normalizeTag(String tag) {
        if (tag == null) {
            return "";
        }
        return tag.trim().replace("#", "").toLowerCase();
    }

    private String normalizeQuery(String query) {
        if (query == null || query.trim().isBlank()) {
            return null;
        }
        return query.trim();
    }

    private String normalizeTagFilter(String tag) {
        String normalized = normalizeTag(tag);
        return normalized.isBlank() ? null : normalized;
    }

    private String cleanNullable(String value) {
        if (value == null || value.trim().isBlank()) {
            return null;
        }
        return value.trim();
    }

    public PostResponseDto toDto(PostEntity post, UserEntity currentUser) {
        boolean liked = currentUser != null && likeRepository.existsByUserIdAndPostId(currentUser.getId(), post.getId());
        boolean editable = currentUser != null && (post.getAuthor().getId().equals(currentUser.getId()) || currentUser.getRole() == Role.ADMIN);

        UserResponseDto author = userService.toDto(post.getAuthor());
        Set<String> tags = post.getTags().stream()
                .map(TagEntity::getName)
                .collect(Collectors.toCollection(LinkedHashSet::new));

        return PostResponseDto.builder()
                .id(post.getId())
                .title(post.getTitle())
                .content(post.getContent())
                .imageUrl(post.getImageUrl())
                .author(author)
                .tags(tags)
                .commentsCount(post.getComments().size())
                .likesCount(post.getLikes().size())
                .likedByCurrentUser(liked)
                .editableByCurrentUser(editable)
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .build();
    }
}
