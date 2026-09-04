package com.unimedvargina.UnimedVarginhaTi.shared.dto;

import com.unimedvargina.UnimedVarginhaTi.shared.model.Sector;

import java.util.UUID;

public record SectorResponseDTO(
        UUID id,
        String name,
        String groupName,
        Integer costCenterCode,
        UUID enterpriseId,
        String enterpriseName
) {
    public static SectorResponseDTO from(Sector sector) {
        return new SectorResponseDTO(
                sector.getId(),
                sector.getName(),
                sector.getGroupName(),
                sector.getCostCenterCode(),
                sector.getEnterprise() == null ? null : sector.getEnterprise().getId(),
                sector.getEnterprise() == null ? null : sector.getEnterprise().getName()
        );
    }
}
