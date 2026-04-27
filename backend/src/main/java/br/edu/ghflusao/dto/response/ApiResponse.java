package br.edu.ghflusao.dto.response;

import java.time.LocalDateTime;

public record ApiResponse<T>(T data, String message, LocalDateTime timestamp) {
    public static <T> ApiResponse<T> ok(T data) {
        return new ApiResponse<>(data, "OK", LocalDateTime.now());
    }

    public static <T> ApiResponse<T> ok(T data, String message) {
        return new ApiResponse<>(data, message, LocalDateTime.now());
    }
}
