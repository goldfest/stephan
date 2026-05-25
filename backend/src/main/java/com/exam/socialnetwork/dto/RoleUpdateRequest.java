package com.exam.socialnetwork.dto;

import com.exam.socialnetwork.enums.Role;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RoleUpdateRequest {
    @NotNull(message = "Роль обязательна")
    private Role role;
}
