package com.unimedvargina.UnimedVarginhaTi.modules.users.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

/** Edicao de usuario. A senha tem endpoint proprio; login nao muda. */
public record UserUpdateDTO(
        @NotBlank(message = "O nome e obrigatorio.")
        @Size(max = 120, message = "O nome deve ter no maximo 120 caracteres.")
        String name,

        @NotBlank(message = "O e-mail e obrigatorio.")
        @Email(message = "Informe um e-mail valido.")
        String email,

        @NotNull(message = "O perfil de acesso e obrigatorio.")
        UUID profileId
) {
}
