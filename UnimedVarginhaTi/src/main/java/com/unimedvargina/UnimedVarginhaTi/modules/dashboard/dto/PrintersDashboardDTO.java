package com.unimedvargina.UnimedVarginhaTi.modules.dashboard.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * Painel das impressoras -- a planilha de contagem de paginas.
 *
 * <p>Reproduz a aba de graficos da planilha, que separa por empresa e por cor
 * (H. Preta, H. Cor, OP Preta, OP Cor), e acrescenta o rateio por centro de
 * custo, que na planilha vive numa tabela dinamica a parte.
 */
public record PrintersDashboardDTO(
        LocalDate competence,
        KpisDTO kpis,
        /** Paginas mes a mes, do mais antigo ao mais novo. */
        List<MonthPagesDTO> pages,
        /** Custo mes a mes, pelo fechamento de cada competencia. */
        List<MonthValueDTO> cost,
        /**
         * Uma serie por empresa, com paginas pretas e coloridas separadas -- e o
         * grafico da planilha. Os meses sao os mesmos de {@code pages}.
         */
        List<EnterpriseSeriesDTO> byEnterprise,
        /**
         * Rateio do mes, agrupado por empresa. O codigo de centro de custo so e
         * unico dentro do CNPJ, entao cada empresa tem a sua tabela.
         */
        List<EnterpriseCostCentersDTO> costCenters
) {
    public record KpisDTO(
            int blackPages,
            int colorPages,
            Integer previousBlackPages,
            Integer previousColorPages,
            BigDecimal monthCost,
            BigDecimal previousCost,
            BigDecimal difference,
            BigDecimal differencePercent,
            /** Paginas e custo somados no ano da competencia. */
            int yearBlackPages,
            int yearColorPages,
            BigDecimal yearCost,
            int year,
            /** Impressoras cuja contagem ainda nao foi informada no mes. */
            int pendingReadings
    ) {}

    public record MonthPagesDTO(LocalDate competence, int blackPages, int colorPages) {}

    public record MonthValueDTO(LocalDate competence, BigDecimal value) {}

    public record EnterpriseSeriesDTO(
            UUID enterpriseId,
            String enterpriseName,
            List<Integer> blackPages,
            List<Integer> colorPages
    ) {}

    public record EnterpriseCostCentersDTO(
            UUID enterpriseId,
            String enterpriseName,
            BigDecimal total,
            List<CostCenterDTO> costCenters
    ) {}

    public record CostCenterDTO(
            UUID sectorId,
            String sectorName,
            String costCenterCode,
            String pyramidCode,
            BigDecimal blackPages,
            BigDecimal colorPages,
            BigDecimal cost
    ) {}
}
