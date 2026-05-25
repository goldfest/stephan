package com.exam.socialnetwork.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequestDto {
    @NotBlank(message = "Имя пользователя обязательно")
    @Size(min = 3, max = 60, message = "Имя пользователя должно быть от 3 до 60 символов")
    private String username;

    @NotBlank(message = "Email обязателен")
    @Email(message = "Некорректный формат email")
    @Size(max = 120, message = "Email должен быть не длиннее 120 символов")
    private String email;

    @NotBlank(message = "Пароль обязателен")
    @Size(min = 6, max = 80, message = "Пароль должен быть от 6 до 80 символов")
    private String password;
}
