package com.exam.socialnetwork.dto;

import com.exam.socialnetwork.enums.Role;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuthResponseDto {
    private String token;
    private Long id;
    private String username;
    private String email;
    private Role role;
}
