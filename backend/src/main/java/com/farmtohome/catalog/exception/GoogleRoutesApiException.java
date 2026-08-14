package com.farmtohome.catalog.exception;

public class GoogleRoutesApiException extends RuntimeException {

    public GoogleRoutesApiException(String message) {
        super(message);
    }

    public GoogleRoutesApiException(String message, Throwable cause) {
        super(message, cause);
    }
}
