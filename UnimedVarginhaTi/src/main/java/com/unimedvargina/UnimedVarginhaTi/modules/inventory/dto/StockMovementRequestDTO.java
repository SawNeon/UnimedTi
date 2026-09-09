package com.unimedvargina.UnimedVarginhaTi.modules.inventory.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.util.UUID;

public record StockMovementRequestDTO(
        @NotNull(message = "A quantidade é obrigatória.")
        @Positive(message = "A quantidade da movimentação deve ser maior que zero.")
        Integer quantity,

        @NotBlank(message = "O motivo é obrigatório.")
        String reason,

        @NotBlank(message = "O responsável é obrigatório.")
        String responsible,

        /** Local de destino do consumo. Opcional em entradas. */
        UUID sectorId
) {
}
