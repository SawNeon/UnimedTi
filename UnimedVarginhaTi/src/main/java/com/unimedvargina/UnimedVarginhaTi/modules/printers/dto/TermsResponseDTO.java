package com.unimedvargina.UnimedVarginhaTi.modules.printers.dto;

import com.unimedvargina.UnimedVarginhaTi.modules.printers.model.PrintingEnterpriseTerms;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record TermsResponseDTO(
        UUID id,
        LocalDate validFrom,
        UUID enterpriseId,
        String enterpriseName,
        Integer colorFranchiseLimit,
        BigDecimal colorFranchiseValue,
        BigDecimal fixedCharge,
        boolean includedInTotal
) {
    public static TermsResponseDTO from(PrintingEnterpriseTerms t) {
        return new TermsResponseDTO(
                t.getId(), t.getValidFrom(),
                t.getEnterprise().getId(), t.getEnterprise().getName(),
                t.getColorFranchiseLimit(), t.getColorFranchiseValue(),
                t.getFixedCharge(), t.isIncludedInTotal());
    }
}
