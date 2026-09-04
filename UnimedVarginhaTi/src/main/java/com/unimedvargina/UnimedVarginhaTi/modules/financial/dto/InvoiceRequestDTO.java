package com.unimedvargina.UnimedVarginhaTi.modules.financial.dto;

import com.unimedvargina.UnimedVarginhaTi.modules.financial.model.CostAllocationType;
import com.unimedvargina.UnimedVarginhaTi.modules.financial.model.InvoiceDeliveryTarget;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * Lancamento de uma nota fiscal.
 *
 * <p>{@code items} so e exigido quando o destino do custo e APPORTIONED. Com
 * ENTERPRISE o custo vai integral para o CNPJ do contrato e a lista tem de vir
 * vazia -- a validacao esta no service, porque depende do valor de outro campo.
 */
public record InvoiceRequestDTO(
        @NotNull(message = "O contrato é obrigatório.")
        UUID contractId,

        @NotBlank(message = "O número da nota é obrigatório.")
        @Size(max = 40, message = "O número da nota deve ter no máximo 40 caracteres.")
        String number,

        /** Mês de referência. Qualquer dia do mês serve; é normalizado para o dia 1. */
        @NotNull(message = "A competência é obrigatória.")
        LocalDate competence,

        @NotNull(message = "O valor total é obrigatório.")
        @DecimalMin(value = "0.01", message = "O valor total deve ser maior que zero.")
        @Digits(integer = 8, fraction = 2, message = "O valor total deve ter no máximo 2 casas decimais.")
        BigDecimal totalAmount,

        @NotNull(message = "A data de emissão é obrigatória.")
        LocalDate issueDate,

        @NotNull(message = "A data de vencimento é obrigatória.")
        LocalDate dueDate,

        @NotNull(message = "Informe o destino do custo: rateio por centro de custo ou CNPJ.")
        CostAllocationType costAllocation,

        /** Opcional: sem valor, assume Suporte Adm, o caminho das notas de contrato. */
        InvoiceDeliveryTarget deliveryTarget,

        /**
         * Opcional: sem valor, é calculado a partir do vencimento pelo calendário do
         * Financeiro. Informe apenas para antecipar em semana de feriado.
         */
        LocalDate deliveryDeadline,

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
