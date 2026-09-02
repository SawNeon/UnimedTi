package com.unimedvargina.UnimedVarginhaTi.shared.exception;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Corpo padrão de erro da API. O frontend pode sempre ler {@code message} para
 * exibir ao usuário e, quando houver erro de validação, detalhar {@code fieldErrors}.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiError(
        LocalDateTime timestamp,
        int status,
        String error,
        String message,
        String path,
        List<FieldError> fieldErrors
) {

    public record FieldError(String field, String message) {}

    public static ApiError of(int status, String error, String message, String path) {
        return new ApiError(LocalDateTime.now(), status, error, message, path, null);
    }

    public static ApiError ofValidation(int status, String error, String message, String path,
                                        List<FieldError> fieldErrors) {
        return new ApiError(LocalDateTime.now(), status, error, message, path, fieldErrors);
    }
}
