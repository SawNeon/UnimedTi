package com.unimedvargina.UnimedVarginhaTi.modules.users.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

/** Criacao de usuario. O perfil e obrigatorio: usuario sem perfil nao acessa nada. */
public record UserRequestDTO(
        @NotBlank(message = "O login e obrigatorio.")
        @Size(min = 3, max = 50, message = "O login deve ter entre 3 e 50 caracteres.")
        String login,

        @NotBlank(message = "A senha e obrigatoria.")
        @Size(min = 8, max = 100, message = "A senha deve ter no minimo 8 caracteres.")
        String password,

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
