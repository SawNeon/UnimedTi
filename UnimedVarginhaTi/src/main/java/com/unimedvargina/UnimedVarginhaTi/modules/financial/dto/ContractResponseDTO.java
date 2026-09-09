package com.unimedvargina.UnimedVarginhaTi.modules.financial.dto;

import com.unimedvargina.UnimedVarginhaTi.modules.financial.model.ContractStatus;
import com.unimedvargina.UnimedVarginhaTi.modules.financial.model.CostAllocationType;
import com.unimedvargina.UnimedVarginhaTi.modules.financial.model.InvoiceComparison;
import com.unimedvargina.UnimedVarginhaTi.modules.financial.model.InvoiceDeliveryTarget;
import com.unimedvargina.UnimedVarginhaTi.modules.financial.model.InvoiceStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

/**
 * Um contrato na visao de um mes -- a linha da aba mensal da planilha.
 *
 * <p>Reproduz as colunas VL ANTERIOR, COMPARATIVO e DIFERENCA, mas os tres sao
 * calculados na consulta a partir da nota do mes anterior. Guardar o valor
 * anterior criaria uma segunda copia que ficaria desatualizada quando a nota
 * passada fosse corrigida.
 */
public record ContractResponseDTO(
        UUID id,
        String enterpriseName,
        String type,
        String serviceDescription,
        ContractStatus status,

        /** Nulo enquanto a nota do mes nao chegou. */
        InvoiceMonthDTO currentInvoice,

        /** Valor da nota do mes anterior, para conferencia. Nulo se nao houve. */
        BigDecimal previousAmount,

        InvoiceComparison comparison,

        /** Valor atual menos o anterior. Nulo enquanto nao ha o que comparar. */
        BigDecimal difference,

        /** A mesma diferenca em percentual do mes anterior. */
        BigDecimal differencePercent
) {
    public record InvoiceMonthDTO(
            UUID id,
            String number,
            BigDecimal value,
            LocalDate issueDate,
            LocalDate dueDate,
            InvoiceStatus status,
            CostAllocationType costAllocation,
            InvoiceDeliveryTarget deliveryTarget,
            /** Prazo do TI para entregar, vindo do calendário do Financeiro. */
            LocalDate deliveryDeadline,
            /** Nulo enquanto a nota não saiu do TI. */
            LocalDate deliveredAt
    ) {}
}
