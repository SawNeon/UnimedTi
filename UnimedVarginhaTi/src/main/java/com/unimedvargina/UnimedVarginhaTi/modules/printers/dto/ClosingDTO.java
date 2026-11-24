package com.unimedvargina.UnimedVarginhaTi.modules.printers.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * Fechamento do mes: o que cada empresa paga e como o custo se reparte pelos
 * centros de custo.
 *
 * <p>Equivale as linhas 73 a 78 da aba do mes na planilha, mais a tabela dinamica
 * por centro de custo -- so que calculado a partir das leituras, e nao digitado.
 */
public record ClosingDTO(
        LocalDate competence,
        BigDecimal blackPageCost,
        BigDecimal colorPageCost,
        List<EnterpriseTotalDTO> enterprises,
        List<SectorTotalDTO> sectors,
        /** Soma apenas das empresas marcadas para entrar no total. */
        BigDecimal total,
        /** Impressoras com leitura nao informada, contador invertido ou sem rateio. */
        PendenciesDTO pendencies
) {
    public record EnterpriseTotalDTO(
            UUID enterpriseId,
            String enterpriseName,
            int blackPages,
            int colorPages,
            BigDecimal blackCost,
            /** Já com a franquia aplicada, quando houver. */
            BigDecimal colorCost,
            boolean franchiseApplied,
            BigDecimal fixedCharge,
            BigDecimal total,
            boolean includedInTotal
    ) {}

    public record SectorTotalDTO(
            UUID sectorId,
            String sectorName,
            String costCenterCode,
            /** Codigo do setor no Piramide, que e o que o Financeiro lanca. */
            String pyramidCode,
            /**
             * Empresa dona do centro de custo. Cada CNPJ tem a propria tabela: o
             * codigo de centro de custo so e unico dentro da empresa, e juntar as
             * duas numa lista so faria dois setores diferentes parecerem o mesmo.
             */
            UUID enterpriseId,
            String enterpriseName,
            /** Paginas ja proporcionais ao percentual do setor em cada impressora. */
            BigDecimal blackPages,
            BigDecimal colorPages,
            BigDecimal cost
    ) {}

    /**
     * O que impede fechar o mes com confianca. Sao as tres situacoes que na
     * planilha passavam despercebidas.
     */
    public record PendenciesDTO(
            List<String> naoInformadas,
            List<String> contadorInvertido,
            List<String> semRateio,
            /** Paginas que ficaram fora do rateio por falta de setor definido. */
            int paginasSemRateio
    ) {}
}
