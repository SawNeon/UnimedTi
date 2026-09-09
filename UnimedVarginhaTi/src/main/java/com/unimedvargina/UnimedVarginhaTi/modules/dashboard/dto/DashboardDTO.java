package com.unimedvargina.UnimedVarginhaTi.modules.dashboard.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * Numeros do painel de gestao, para um mes de referencia.
 *
 * <p>Reune o que hoje vive em duas planilhas: a aba Valores do Controle de Notas e
 * a aba Custo Mensal da contagem de impressoras.
 */
public record DashboardDTO(
        LocalDate competence,
        KpisDTO kpis,
        /** Serie mensal para o grafico de evolucao, do mes mais antigo ao mais novo. */
        List<MonthPointDTO> series,
        List<NamedValueDTO> byEnterprise,
        /** Centros de custo do mes, do maior para o menor. */
        List<NamedValueDTO> bySector,
        List<MonthPagesDTO> pages
) {
    public record KpisDTO(
            BigDecimal total,
            BigDecimal previousTotal,
            BigDecimal difference,
            BigDecimal differencePercent,
            /** Contratos ativos sem nota lancada no mes. */
            int pendingInvoices,
            int contractsWithInvoice,
            int blackPages,
            int colorPages
    ) {}

    public record MonthPointDTO(
            LocalDate competence,
            BigDecimal contracts,
            BigDecimal printers,
            BigDecimal total
    ) {}

    public record NamedValueDTO(UUID id, String name, Integer code, BigDecimal value) {}

    public record MonthPagesDTO(LocalDate competence, int blackPages, int colorPages) {}
}
