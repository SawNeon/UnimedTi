package com.unimedvargina.UnimedVarginhaTi.modules.financial.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record InvoiceApportionmentTemplateDTO(
        UUID sourceInvoiceId,
        String sourceInvoiceNumber,
        LocalDate sourceIssueDate,
        BigDecimal sourceTotalAmount,
        List<ApportionmentTemplateItemDTO> items
) {
    public record ApportionmentTemplateItemDTO(
            UUID sectorId,
            String sectorName,
            BigDecimal allocation,
            BigDecimal percentage
    ) {}
}
