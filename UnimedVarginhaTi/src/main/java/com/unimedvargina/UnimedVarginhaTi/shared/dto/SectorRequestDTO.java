package com.unimedvargina.UnimedVarginhaTi.shared.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.util.UUID;

/**
 * Setor / centro de custo.
 *
 * <p>O {@code costCenterCode} e o codigo contabil e o {@code groupName} e o
 * agrupamento usado no rateio ("2. Produtivos", "3. Apoios").
 */
public record SectorRequestDTO(
        @NotBlank(message = "O nome do setor é obrigatório.")
        @Size(max = 120, message = "O nome deve ter no máximo 120 caracteres.")
        String name,

        @NotNull(message = "A empresa é obrigatória.")
        UUID enterpriseId,

        @NotBlank(message = "O grupo é obrigatório.")
        @Size(max = 60, message = "O grupo deve ter no máximo 60 caracteres.")
        String groupName,

        @NotNull(message = "O código do centro de custo é obrigatório.")
        @PositiveOrZero(message = "O código do centro de custo não pode ser negativo.")
        Integer costCenterCode
) {
}
