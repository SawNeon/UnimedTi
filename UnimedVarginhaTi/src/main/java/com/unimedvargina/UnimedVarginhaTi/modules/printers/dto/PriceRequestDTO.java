package com.unimedvargina.UnimedVarginhaTi.modules.printers.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

/** Preco da pagina valido a partir de um mes. Qualquer dia do mes serve. */
public record PriceRequestDTO(
        @NotNull(message = "A vigência é obrigatória.")
        LocalDate validFrom,

        @NotNull(message = "O preço da página preta é obrigatório.")
        @DecimalMin(value = "0.0", message = "O preço da página preta não pode ser negativo.")
        BigDecimal blackPageCost,

        @NotNull(message = "O preço da página colorida é obrigatório.")
        @DecimalMin(value = "0.0", message = "O preço da página colorida não pode ser negativo.")
        BigDecimal colorPageCost
) {
}
