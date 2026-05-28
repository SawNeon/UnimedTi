package com.unimedvargina.UnimedVarginhaTi.modules.financial.dto;

import com.unimedvargina.UnimedVarginhaTi.modules.financial.model.ContractStatus;
import com.unimedvargina.UnimedVarginhaTi.modules.financial.model.InvoiceStatus;
import java.math.BigDecimal;
import java.util.UUID;

public record ContractResponseDTO(
        UUID id,
        String enterpriseName,
        String type,
        String serviceDescription,
        ContractStatus status,
        InvoiceMonthDTO currentInvoice //
) {
    public record InvoiceMonthDTO(
            UUID id,
            Integer number,
            BigDecimal value,
            InvoiceStatus status
    ) {}
}