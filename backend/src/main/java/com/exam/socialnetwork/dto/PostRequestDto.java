package com.exam.socialnetwork.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.LinkedHashSet;
import java.util.Set;

@Data
public class PostRequestDto {
    @NotBlank(message = "Заголовок обязателен")
    @Size(min = 3, max = 120, message = "Заголовок должен быть от 3 до 120 символов")
    private String title;

    @NotBlank(message = "Текст поста обязателен")
    @Size(min = 10, max = 5000, message = "Текст поста должен быть от 10 до 5000 символов")
    private String content;

    @Size(max = 500, message = "Ссылка на изображение должна быть не длиннее 500 символов")
    private String imageUrl;

    private Set<@Size(min = 2, max = 40, message = "Тег должен быть от 2 до 40 символов") String> tags = new LinkedHashSet<>();
}
