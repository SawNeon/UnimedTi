package com.unimedvargina.UnimedVarginhaTi.modules.printers.dto;

import com.unimedvargina.UnimedVarginhaTi.modules.printers.model.PrinterReading;
import com.unimedvargina.UnimedVarginhaTi.modules.printers.model.ReadingSource;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/** Uma linha do fechamento do mes -- equivale a uma linha da aba MES da planilha. */
public record ReadingResponseDTO(
        UUID id,
        UUID printerId,
        String serialNumber,
        String model,
        String assetTag,
        String enterpriseName,
        LocalDate competence,
        Integer blackStart,
        Integer blackEnd,
        Integer colorStart,
        Integer colorEnd,
        Integer a3Black,
        Integer a3Color,
        /** Diferenca entre fim e inicio, ja somando A3. */
        int blackConsumption,
        int colorConsumption,
        ReadingSource source,
        boolean corrected,
        /** Contador que andou para tras: precisa de conferencia. */
        boolean inconsistent,
        /** Sem rateio definido -- o caso da reserva antes de ser usada. */
        boolean withoutShares,
        /** Verdadeiro enquanto ninguem informou a contagem do mes. */
        boolean pending,
        String notes,
        List<ShareDTO> shares
) {
    public record ShareDTO(UUID sectorId, String sectorName, Integer costCenterCode, BigDecimal percentage) {}

    public static ReadingResponseDTO from(PrinterReading r) {
        List<ShareDTO> shares = r.getShares().stream()
                .map(s -> new ShareDTO(
                        s.getSector().getId(),
                        s.getSector().getName(),
                        s.getSector().getCostCenterCode(),
                        s.getPercentage()))
                .toList();

        return new ReadingResponseDTO(
                r.getId(),
                r.getPrinter().getId(),
                r.getPrinter().getSerialNumber(),
                r.getPrinter().getModel(),
                r.getPrinter().getAssetTag(),
                r.getPrinter().getEnterprise() == null ? null : r.getPrinter().getEnterprise().getName(),
                r.getCompetence(),
                r.getBlackStart(), r.getBlackEnd(),
                r.getColorStart(), r.getColorEnd(),
                r.getA3Black(), r.getA3Color(),
                r.blackConsumption(), r.colorConsumption(),
                r.getSource(), r.isCorrected(), r.isInconsistent(),
                shares.isEmpty(), !r.isInformed(),
                r.getNotes(), shares
        );
    }
}
