package com.unimedvargina.UnimedVarginhaTi.shared.exception;

import java.util.UUID;

/**
 * Lançada quando um registro referenciado não existe. Resulta em HTTP 404.
 */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }

    public ResourceNotFoundException(String resourceName, UUID id) {
        super(resourceName + " não encontrado(a): " + id);
    }
}
