package com.exam.socialnetwork.controller;

import com.exam.socialnetwork.dto.AuthResponseDto;
import com.exam.socialnetwork.dto.LoginRequestDto;
import com.exam.socialnetwork.dto.RegisterRequestDto;
import com.exam.socialnetwork.entity.UserEntity;
import com.exam.socialnetwork.service.AuthService;
import com.exam.socialnetwork.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;
    private final UserService userService;

    @PostMapping("/register")
    public AuthResponseDto register(@Valid @RequestBody RegisterRequestDto request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public AuthResponseDto login(@Valid @RequestBody LoginRequestDto request) {
        return authService.login(request);
    }

    @GetMapping("/me")
    public AuthResponseDto me(Authentication authentication) {
        UserEntity current = userService.getCurrentUser(authentication);
        return authService.buildAuthResponse(current);
    }
}
