package com.unimedvargina.UnimedVarginhaTi.shared.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

/**
 * Setor / centro de custo.
 *
 * <p>O {@code costCenterCode} e o codigo contabil e o {@code groupName} e o
 * agrupamento usado no rateio ("2. Produtivos", "3. Apoios"). O
 * {@code pyramidCode} e o codigo do mesmo setor no Piramide, usado pelo
 * Financeiro para lancar a nota -- na Operadora ele nao e o mesmo numero do
 * centro de custo.
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

        @NotBlank(message = "O código do centro de custo é obrigatório.")
        @Size(max = 20, message = "O código do centro de custo deve ter no máximo 20 caracteres.")
        String costCenterCode,

        @Size(max = 20, message = "O código do Pirâmide deve ter no máximo 20 caracteres.")
        String pyramidCode
) {
}
