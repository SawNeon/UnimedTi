package com.unimedvargina.UnimedVarginhaTi.modules.printers.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

/** Condicoes do contrato de impressao de uma empresa, a partir de um mes. */
public record TermsRequestDTO(
        @NotNull(message = "A vigência é obrigatória.")
        LocalDate validFrom,

        @NotNull(message = "A empresa é obrigatória.")
        UUID enterpriseId,

        /** Até este número de páginas coloridas cobra-se a franquia. Zero desliga. */
        @NotNull @PositiveOrZero(message = "O limite da franquia não pode ser negativo.")
        Integer colorFranchiseLimit,

        @NotNull @DecimalMin(value = "0.0", message = "O valor da franquia não pode ser negativo.")
        BigDecimal colorFranchiseValue,

        /** Acréscimo fixo mensal, como o Plantão. */
        @NotNull @DecimalMin(value = "0.0", message = "O acréscimo fixo não pode ser negativo.")
        BigDecimal fixedCharge,

        /** Falso para serviço próprio, que fica fora do total do fechamento. */
        boolean includedInTotal
) {
}
