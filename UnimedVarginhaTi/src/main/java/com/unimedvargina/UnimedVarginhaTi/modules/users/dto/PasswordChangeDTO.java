package com.unimedvargina.UnimedVarginhaTi.modules.users.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PasswordChangeDTO(
        @NotBlank(message = "A senha e obrigatoria.")
        @Size(min = 8, max = 100, message = "A senha deve ter no minimo 8 caracteres.")
        String password
) {
}
