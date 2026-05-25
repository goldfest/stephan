package com.exam.socialnetwork.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CommentRequestDto {
    @NotBlank(message = "Комментарий не может быть пустым")
    @Size(min = 2, max = 1500, message = "Комментарий должен быть от 2 до 1500 символов")
    private String text;
}
