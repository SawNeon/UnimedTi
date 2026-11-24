package com.unimedvargina.UnimedVarginhaTi.modules.printers.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * Lancamento manual ou correcao de uma leitura.
 *
 * <p>Serve tanto para a impressora que o PrintWay nao le quanto para ajustar um
 * numero importado que veio errado. No segundo caso a leitura fica marcada como
 * corrigida, preservando que a origem foi o PrintWay.
 */
public record ReadingUpdateDTO(
        @NotNull @PositiveOrZero(message = "O contador inicial preto não pode ser negativo.")
        Integer blackStart,

        @NotNull @PositiveOrZero(message = "O contador final preto não pode ser negativo.")
        Integer blackEnd,

        @NotNull @PositiveOrZero(message = "O contador inicial colorido não pode ser negativo.")
        Integer colorStart,

        @NotNull @PositiveOrZero(message = "O contador final colorido não pode ser negativo.")
        Integer colorEnd,

        @PositiveOrZero(message = "As páginas A3 preto não podem ser negativas.")
        Integer a3Black,

        @PositiveOrZero(message = "As páginas A3 coloridas não podem ser negativas.")
        Integer a3Color,

        @Size(max = 255, message = "A observação deve ter no máximo 255 caracteres.")
        String notes,

        /** Rateio deste mês. Nulo mantém o que já está gravado. */
        @Valid
        List<ShareDTO> shares
) {
    public record ShareDTO(
            @NotNull(message = "O setor do rateio é obrigatório.")
            UUID sectorId,

            @NotNull(message = "O percentual é obrigatório.")
            @DecimalMin(value = "0.0001", message = "O percentual deve ser maior que zero.")
            @DecimalMax(value = "100.0000", message = "O percentual não pode passar de 100.")
            BigDecimal percentage
    ) {}
}
