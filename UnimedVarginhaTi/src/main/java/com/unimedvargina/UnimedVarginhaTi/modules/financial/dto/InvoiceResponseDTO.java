package com.unimedvargina.UnimedVarginhaTi.modules.financial.dto;

import com.unimedvargina.UnimedVarginhaTi.modules.financial.model.InvoiceStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record InvoiceResponseDTO(
        UUID id,
        UUID contractId,
        String number,
        BigDecimal totalAmount,
        LocalDate issueDate,
        LocalDate dueDate,
        InvoiceStatus status,
        String serviceDescription,
        String serviceType,
        List<ApportionmentItemResponseDTO> items
) {
    public record ApportionmentItemResponseDTO(
            UUID sectorId,
            String sectorName,
            Integer costCenterCode,
            BigDecimal allocation,
            BigDecimal percentage
    ) {}
}