package com.unimedvargina.UnimedVarginhaTi.shared.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Empresa (CNPJ) do grupo. */
public record EnterpriseRequestDTO(
        @NotBlank(message = "O nome da empresa é obrigatório.")
        @Size(max = 120, message = "O nome deve ter no máximo 120 caracteres.")
        String name,

        @NotBlank(message = "A localidade é obrigatória.")
        @Size(max = 120, message = "A localidade deve ter no máximo 120 caracteres.")
        String locale
) {
}
