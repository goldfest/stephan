package com.exam.socialnetwork.config;

import com.exam.socialnetwork.entity.CommentEntity;
import com.exam.socialnetwork.entity.LikeEntity;
import com.exam.socialnetwork.entity.PostEntity;
import com.exam.socialnetwork.entity.TagEntity;
import com.exam.socialnetwork.entity.UserEntity;
import com.exam.socialnetwork.enums.Role;
import com.exam.socialnetwork.repository.CommentRepository;
import com.exam.socialnetwork.repository.LikeRepository;
import com.exam.socialnetwork.repository.PostRepository;
import com.exam.socialnetwork.repository.TagRepository;
import com.exam.socialnetwork.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.io.InputStream;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {
    private static final String SEED_FILE = "seed-data.json";

    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final LikeRepository likeRepository;
    private final TagRepository tagRepository;
    private final PasswordEncoder passwordEncoder;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) {
            return;
        }

        SeedData seedData = readSeedData();

        Map<String, UserEntity> usersByUsername = new LinkedHashMap<>();
        for (SeedUser user : seedData.users()) {
            UserEntity savedUser = userRepository.save(UserEntity.builder()
                    .username(user.username())
                    .email(user.email())
                    .passwordHash(passwordEncoder.encode(user.password()))
                    .role(Role.valueOf(user.role()))
                    .build());
            usersByUsername.put(savedUser.getUsername(), savedUser);
        }

        Map<String, TagEntity> tagsByName = new LinkedHashMap<>();
        for (String tagName : seedData.tags()) {
            TagEntity savedTag = tagRepository.findByNameIgnoreCase(tagName)
                    .orElseGet(() -> tagRepository.save(TagEntity.builder().name(tagName).build()));
            tagsByName.put(savedTag.getName(), savedTag);
        }

        Map<String, PostEntity> postsByTitle = new LinkedHashMap<>();
        for (SeedPost post : seedData.posts()) {
            UserEntity author = requireUser(usersByUsername, post.author());
            Set<TagEntity> postTags = post.tags().stream()
                    .map(tagName -> requireTag(tagsByName, tagName))
                    .collect(Collectors.toSet());

            PostEntity savedPost = postRepository.save(PostEntity.builder()
                    .title(post.title())
                    .content(post.content())
                    .imageUrl(post.imageUrl())
                    .author(author)
                    .tags(postTags)
                    .build());
            postsByTitle.put(savedPost.getTitle(), savedPost);
        }

        List<CommentEntity> comments = seedData.comments().stream()
                .map(comment -> CommentEntity.builder()
                        .text(comment.text())
                        .post(requirePost(postsByTitle, comment.postTitle()))
                        .author(requireUser(usersByUsername, comment.author()))
                        .build())
                .toList();
        commentRepository.saveAll(comments);

        List<LikeEntity> likes = seedData.likes().stream()
                .map(like -> LikeEntity.builder()
                        .post(requirePost(postsByTitle, like.postTitle()))
                        .user(requireUser(usersByUsername, like.username()))
                        .build())
                .toList();
        likeRepository.saveAll(likes);
    }

    private SeedData readSeedData() {
        try (InputStream inputStream = new ClassPathResource(SEED_FILE).getInputStream()) {
            return objectMapper.readValue(inputStream, SeedData.class);
        } catch (IOException e) {
            throw new IllegalStateException("Cannot load test data file: backend/src/main/resources/" + SEED_FILE, e);
        }
    }

    private UserEntity requireUser(Map<String, UserEntity> usersByUsername, String username) {
        UserEntity user = usersByUsername.get(username);
        if (user == null) {
            throw new IllegalArgumentException("Unknown seed user: " + username);
        }
        return user;
    }

    private TagEntity requireTag(Map<String, TagEntity> tagsByName, String tagName) {
        TagEntity tag = tagsByName.get(tagName);
        if (tag == null) {
            throw new IllegalArgumentException("Unknown seed tag: " + tagName);
        }
        return tag;
    }

    private PostEntity requirePost(Map<String, PostEntity> postsByTitle, String title) {
        PostEntity post = postsByTitle.get(title);
        if (post == null) {
            throw new IllegalArgumentException("Unknown seed post: " + title);
        }
        return post;
    }

    private record SeedData(
            List<SeedUser> users,
            List<String> tags,
            List<SeedPost> posts,
            List<SeedComment> comments,
            List<SeedLike> likes
    ) {
    }

    private record SeedUser(String username, String email, String password, String role) {
    }

    private record SeedPost(String title, String content, String imageUrl, String author, List<String> tags) {
    }

    private record SeedComment(String postTitle, String author, String text) {
    }

    private record SeedLike(String postTitle, String username) {
    }
}
