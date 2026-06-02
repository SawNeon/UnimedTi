package com.unimedvargina.UnimedVarginhaTi.modules.financial.dto;

import com.unimedvargina.UnimedVarginhaTi.modules.financial.model.InvoiceStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record InvoiceResponseDTO(
        UUID id,
        UUID contractId,
        Integer number,
        BigDecimal totalAmount,
        LocalDate issueDate,
        LocalDate dueDate,
        InvoiceStatus status,
        List<ApportionmentItemResponseDTO> items
) {
    public record ApportionmentItemResponseDTO(
            UUID sectorId,
            String sectorName,
            BigDecimal allocation
    ) {}
}