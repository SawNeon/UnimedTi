package com.unimedvargina.UnimedVarginhaTi.modules.financial.dto;

import com.unimedvargina.UnimedVarginhaTi.modules.financial.model.InvoiceStatus;
import java.math.BigDecimal;
import java.util.UUID;

public record InvoiceResponseDTO(
        UUID id,
        Integer number,
        BigDecimal value,
        InvoiceStatus status,
        String costCenters
) {}