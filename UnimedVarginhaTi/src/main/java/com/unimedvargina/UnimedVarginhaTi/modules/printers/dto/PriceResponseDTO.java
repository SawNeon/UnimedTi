package com.unimedvargina.UnimedVarginhaTi.modules.printers.dto;

import com.unimedvargina.UnimedVarginhaTi.modules.printers.model.PrintingPrice;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record PriceResponseDTO(UUID id, LocalDate validFrom, BigDecimal blackPageCost, BigDecimal colorPageCost) {

    public static PriceResponseDTO from(PrintingPrice p) {
        return new PriceResponseDTO(p.getId(), p.getValidFrom(), p.getBlackPageCost(), p.getColorPageCost());
    }
}
