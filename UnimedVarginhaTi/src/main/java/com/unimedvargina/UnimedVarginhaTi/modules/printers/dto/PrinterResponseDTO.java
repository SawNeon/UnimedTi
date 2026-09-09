package com.unimedvargina.UnimedVarginhaTi.modules.printers.dto;

import com.unimedvargina.UnimedVarginhaTi.modules.printers.model.Printer;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record PrinterResponseDTO(
        UUID id,
        String serialNumber,
        String assetTag,
        String model,
        String ipAddress,
        UUID enterpriseId,
        String enterpriseName,
        boolean autoRead,
        boolean backup,
        boolean active,
        List<ShareDTO> shares
) {
    public record ShareDTO(UUID sectorId, String sectorName, Integer costCenterCode, BigDecimal percentage) {}

    public static PrinterResponseDTO from(Printer printer) {
        List<ShareDTO> shares = printer.getShares().stream()
                .map(s -> new ShareDTO(
                        s.getSector().getId(),
                        s.getSector().getName(),
                        s.getSector().getCostCenterCode(),
                        s.getPercentage()))
                .toList();

        return new PrinterResponseDTO(
                printer.getId(),
                printer.getSerialNumber(),
                printer.getAssetTag(),
                printer.getModel(),
                printer.getIpAddress(),
                printer.getEnterprise() == null ? null : printer.getEnterprise().getId(),
                printer.getEnterprise() == null ? null : printer.getEnterprise().getName(),
                printer.isAutoRead(),
                printer.isBackup(),
                printer.isActive(),
                shares
        );
    }
}
