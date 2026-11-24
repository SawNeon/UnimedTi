package com.unimedvargina.UnimedVarginhaTi.modules.users.dto;

import com.unimedvargina.UnimedVarginhaTi.modules.users.model.User;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Usuario para consumo do frontend.
 *
 * <p>Nao existe campo de senha aqui, nem sequer o hash: um DTO explicito e o que
 * garante que a entidade nunca vaze por serializacao acidental.
 */
public record UserResponseDTO(
        UUID id,
        String login,
        String name,
        String email,
        boolean active,
        UUID profileId,
        String profileName,
        LocalDateTime createdAt
) {
    public static UserResponseDTO from(User user) {
        return new UserResponseDTO(
                user.getId(),
                user.getLogin(),
                user.getName(),
                user.getEmail(),
                user.isActive(),
                user.getProfile() == null ? null : user.getProfile().getId(),
                user.getProfile() == null ? null : user.getProfile().getName(),
                user.getCreatedAt()
        );
    }
}
