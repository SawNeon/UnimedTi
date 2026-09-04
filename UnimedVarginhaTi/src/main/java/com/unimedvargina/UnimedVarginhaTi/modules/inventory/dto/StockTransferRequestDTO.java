package com.unimedvargina.UnimedVarginhaTi.modules.inventory.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.util.UUID;

/** Transferência de um produto entre os estoques das duas equipes. */
public record StockTransferRequestDTO(
        @NotNull(message = "A unidade de origem é obrigatória.")
        UUID fromUnitId,

        @NotNull(message = "A unidade de destino é obrigatória.")
        UUID toUnitId,

        @NotNull(message = "A quantidade é obrigatória.")
        @Positive(message = "A quantidade da transferência deve ser maior que zero.")
        Integer quantity,

        @NotBlank(message = "O motivo é obrigatório.")
        String reason,

        @NotBlank(message = "O responsável é obrigatório.")
        String responsible
) {
}
