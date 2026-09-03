package com.unimedvargina.UnimedVarginhaTi.modules.inventory.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

/**
 * Cadastro/edição de produto. O {@code minStockLevel} vale para a unidade em
 * contexto — cada estoque tem seu próprio ponto de pedido.
 */
public record ProductRequestDTO(
        @NotBlank(message = "O nome do produto é obrigatório.")
        @Size(max = 255, message = "O nome deve ter no máximo 255 caracteres.")
        String name,

        @Size(max = 255, message = "A descrição deve ter no máximo 255 caracteres.")
        String description,

        @NotNull(message = "O ponto de pedido é obrigatório.")
        @PositiveOrZero(message = "O ponto de pedido não pode ser negativo.")
        Integer minStockLevel
) {
}
