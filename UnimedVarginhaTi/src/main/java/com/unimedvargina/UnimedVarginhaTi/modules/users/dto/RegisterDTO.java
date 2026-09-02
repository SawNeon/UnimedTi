package com.unimedvargina.UnimedVarginhaTi.modules.users.dto;

import com.unimedvargina.UnimedVarginhaTi.modules.users.model.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record RegisterDTO(
        @NotBlank(message = "O login é obrigatório.")
        @Size(min = 3, max = 50, message = "O login deve ter entre 3 e 50 caracteres.")
        String login,

        @NotBlank(message = "A senha é obrigatória.")
        @Size(min = 8, max = 100, message = "A senha deve ter no mínimo 8 caracteres.")
        String password,

        @NotNull(message = "O perfil de acesso é obrigatório.")
        UserRole role,

        @NotBlank(message = "O nome é obrigatório.")
        @Size(max = 120, message = "O nome deve ter no máximo 120 caracteres.")
        String name,

        @NotBlank(message = "O e-mail é obrigatório.")
        @Email(message = "Informe um e-mail válido.")
        String email
) {
}
