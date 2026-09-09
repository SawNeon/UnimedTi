package com.unimedvargina.UnimedVarginhaTi.shared.dto;

import com.unimedvargina.UnimedVarginhaTi.shared.model.Enterprise;

import java.util.UUID;

public record EnterpriseResponseDTO(UUID id, String name, String locale, long sectorCount) {

    public static EnterpriseResponseDTO from(Enterprise enterprise, long sectorCount) {
        return new EnterpriseResponseDTO(
                enterprise.getId(), enterprise.getName(), enterprise.getLocale(), sectorCount);
    }
}
