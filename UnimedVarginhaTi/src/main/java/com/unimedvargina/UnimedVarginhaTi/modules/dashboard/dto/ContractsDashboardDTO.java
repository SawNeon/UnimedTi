package com.unimedvargina.UnimedVarginhaTi.modules.dashboard.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * Painel dos contratos -- a planilha Controle de Notas Fiscais.
 *
 * <p>Aqui so entram notas de contrato. O contrato das impressoras entra como
 * qualquer outro: o que a Printec fatura vira nota e aparece neste painel. O que
 * NAO aparece e o rateio por centro de custo, que e a cobranca que sai do TI para
 * os outros setores -- outra pergunta, respondida no painel de impressoras.
 */
public record ContractsDashboardDTO(
        LocalDate competence,
        KpisDTO kpis,
        /** Custo mes a mes, do mais antigo ao mais novo. */
        List<MonthValueDTO> series,
        /** Custo do mes por empresa (CNPJ). */
        List<NamedValueDTO> byEnterprise,
        /** Gasto do ANO por categoria de servico -- a coluna TIPO da planilha. */
        List<NamedValueDTO> byServiceType
) {
    public record KpisDTO(
            BigDecimal total,
            BigDecimal previousTotal,
            BigDecimal difference,
            BigDecimal differencePercent,
            /** Contratos ativos ainda sem nota lancada no mes. */
            int pendingInvoices,
            int contractsWithInvoice,
            /** Custo do TI no ano da competencia. */
            BigDecimal yearTotal,
            int year
    ) {}

    public record MonthValueDTO(LocalDate competence, BigDecimal value) {}

    public record NamedValueDTO(UUID id, String name, BigDecimal value) {}
}
