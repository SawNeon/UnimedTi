package com.unimedvargina.UnimedVarginhaTi.shared.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Empresa fornecedora -- quem emite a nota do contrato. */
public record SupplierRequestDTO(
        @NotBlank(message = "O nome do fornecedor é obrigatório.")
        @Size(max = 160, message = "O nome deve ter no máximo 160 caracteres.")
        String name,

        @Size(max = 20, message = "O CNPJ deve ter no máximo 20 caracteres.")
        String document,

        @Size(max = 255, message = "A observação deve ter no máximo 255 caracteres.")
        String notes,

        Boolean active
) {
}
