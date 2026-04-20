package com.unimedvargina.UnimedVarginhaTi.modules.financial.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record InvoiceRequestDTO(
        UUID contractId,
        Integer number,
        BigDecimal totalAmount,
        LocalDate issueDate,
        LocalDate dueDate,
        List<ApportionmentItemDTO> items
) {
    public record ApportionmentItemDTO(
            UUID sectorId,
            BigDecimal allocation
    ) {}
}