package com.farmtohome.catalog.exception;

public class TooManyOtpRequestsException extends RuntimeException {

    public TooManyOtpRequestsException(String message) {
        super(message);
    }
}
