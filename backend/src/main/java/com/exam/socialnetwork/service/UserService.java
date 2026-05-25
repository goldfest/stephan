package com.exam.socialnetwork.service;

import com.exam.socialnetwork.dto.RoleUpdateRequest;
import com.exam.socialnetwork.dto.UserResponseDto;
import com.exam.socialnetwork.entity.UserEntity;
import com.exam.socialnetwork.enums.Role;
import com.exam.socialnetwork.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public UserEntity getCurrentUser(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new AccessDeniedException("Необходима авторизация");
        }
        return userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Текущий пользователь не найден"));
    }

    @Transactional(readOnly = true)
    public List<UserResponseDto> findAll() {
        return userRepository.findAll(Sort.by(Sort.Direction.ASC, "username"))
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public UserResponseDto updateRole(Long userId, RoleUpdateRequest request, Authentication authentication) {
        UserEntity current = getCurrentUser(authentication);
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Пользователь не найден"));

        if (current.getId().equals(user.getId()) && request.getRole() != Role.ADMIN) {
            throw new IllegalArgumentException("Нельзя снять роль ADMIN у самого себя");
        }

        user.setRole(request.getRole());
        return toDto(userRepository.save(user));
    }

    @Transactional
    public void delete(Long userId, Authentication authentication) {
        UserEntity current = getCurrentUser(authentication);
        if (current.getId().equals(userId)) {
            throw new IllegalArgumentException("Нельзя удалить самого себя");
        }
        if (!userRepository.existsById(userId)) {
            throw new ResponseStatusException(NOT_FOUND, "Пользователь не найден");
        }
        userRepository.deleteById(userId);
    }

    public UserResponseDto toDto(UserEntity user) {
        return UserResponseDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
