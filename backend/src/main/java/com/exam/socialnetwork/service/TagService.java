package com.exam.socialnetwork.service;

import com.exam.socialnetwork.dto.TagResponseDto;
import com.exam.socialnetwork.entity.TagEntity;
import com.exam.socialnetwork.repository.TagRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TagService {
    private final TagRepository tagRepository;

    @Transactional(readOnly = true)
    public List<TagResponseDto> findAll() {
        return tagRepository.findAll(Sort.by(Sort.Direction.ASC, "name"))
                .stream()
                .map(this::toDto)
                .toList();
    }

    public TagResponseDto toDto(TagEntity tag) {
        return TagResponseDto.builder()
                .id(tag.getId())
                .name(tag.getName())
                .build();
    }
}
