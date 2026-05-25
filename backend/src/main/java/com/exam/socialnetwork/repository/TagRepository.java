package com.exam.socialnetwork.repository;

import com.exam.socialnetwork.entity.TagEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TagRepository extends JpaRepository<TagEntity, Long> {
    Optional<TagEntity> findByNameIgnoreCase(String name);
    boolean existsByNameIgnoreCase(String name);
}
