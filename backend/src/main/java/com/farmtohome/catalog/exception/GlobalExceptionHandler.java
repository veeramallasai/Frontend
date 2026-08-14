package com.farmtohome.catalog.exception;

import com.farmtohome.catalog.api.ApiResponse;
import jakarta.validation.ConstraintViolationException;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.MultipartException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private ResponseEntity<Map<String, Object>> errorBody(HttpStatus status, String message) {
        return ResponseEntity.status(status).body(Map.of(
            "status", status.value(),
            "message", message,
            "timestamp", LocalDateTime.now().toString()
        ));
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<Object>> handleResourceNotFound(ResourceNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(ApiResponse.failure(ex.getMessage(), null));
    }

    @ExceptionHandler({ MethodArgumentNotValidException.class, ConstraintViolationException.class, IllegalArgumentException.class })
    public ResponseEntity<ApiResponse<Object>> handleValidation(Exception ex) {
        String message;

        if (ex instanceof MethodArgumentNotValidException methodArgumentNotValidException) {
            message = methodArgumentNotValidException
                .getBindingResult()
                .getFieldErrors()
                .stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .collect(Collectors.joining(", "));
        } else if (ex instanceof ConstraintViolationException constraintViolationException) {
            message = constraintViolationException
                .getConstraintViolations()
                .stream()
                .map(violation -> violation.getPropertyPath() + ": " + violation.getMessage())
                .collect(Collectors.joining(", "));
        } else {
            message = ex.getMessage();
        }

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(ApiResponse.failure(message, null));
    }

    @ExceptionHandler({ FileStorageException.class, MultipartException.class, MaxUploadSizeExceededException.class })
    public ResponseEntity<ApiResponse<Object>> handleFileUpload(Exception ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(ApiResponse.failure(ex.getMessage(), null));
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiResponse<Object>> handleAuthenticationFailure(Exception ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
            .body(ApiResponse.failure("Invalid email or password", null));
    }

    @ExceptionHandler(ExportException.class)
    public ResponseEntity<ApiResponse<Object>> handleExportException(ExportException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(ApiResponse.failure(ex.getMessage(), null));
    }

    @ExceptionHandler(TooManyOtpRequestsException.class)
    public ResponseEntity<ApiResponse<Object>> handleTooManyOtpRequests(TooManyOtpRequestsException ex) {
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
            .body(ApiResponse.failure(ex.getMessage(), null));
    }

    @ExceptionHandler(DeliveryRouteNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleRouteNotFound(DeliveryRouteNotFoundException ex) {
        return errorBody(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    @ExceptionHandler(GoogleRoutesApiException.class)
    public ResponseEntity<Map<String, Object>> handleGoogleRoutesApiException(GoogleRoutesApiException ex) {
        return errorBody(HttpStatus.BAD_GATEWAY, ex.getMessage());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Object>> handleGeneric(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(ApiResponse.failure("An unexpected error occurred. Please contact the administrator.", null));
    }
}
