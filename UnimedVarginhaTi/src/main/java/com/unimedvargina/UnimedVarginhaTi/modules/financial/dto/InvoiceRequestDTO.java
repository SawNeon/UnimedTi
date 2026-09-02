package com.unimedvargina.UnimedVarginhaTi.modules.financial.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record InvoiceRequestDTO(
        @NotNull(message = "O contrato é obrigatório.")
        UUID contractId,

        @NotNull(message = "O número da fatura é obrigatório.")
        @Positive(message = "O número da fatura deve ser positivo.")
        Integer number,

        @NotNull(message = "O valor total é obrigatório.")
        @DecimalMin(value = "0.01", message = "O valor total deve ser maior que zero.")
        @Digits(integer = 8, fraction = 2, message = "O valor total deve ter no máximo 2 casas decimais.")
        BigDecimal totalAmount,

        @NotNull(message = "A data de emissão é obrigatória.")
        LocalDate issueDate,

        @NotNull(message = "A data de vencimento é obrigatória.")
        LocalDate dueDate,

        @NotEmpty(message = "Informe ao menos um setor no rateio.")
        @Valid
        List<ApportionmentItemDTO> items
) {
    public record ApportionmentItemDTO(
            @NotNull(message = "O setor do rateio é obrigatório.")
            UUID sectorId,

            @NotNull(message = "O valor do rateio é obrigatório.")
            @DecimalMin(value = "0.00", message = "O valor do rateio não pode ser negativo.")
            @Digits(integer = 8, fraction = 2, message = "O valor do rateio deve ter no máximo 2 casas decimais.")
            BigDecimal allocation
    ) {}
}
