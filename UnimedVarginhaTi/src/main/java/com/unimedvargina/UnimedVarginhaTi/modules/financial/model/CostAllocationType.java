package com.unimedvargina.UnimedVarginhaTi.modules.financial.model;

/**
 * Para onde vai o custo da nota. Toda nota tem um destino -- nao existe nota sem.
 *
 * <p>Na planilha isto era a coluna CC (SIM/NAO), mas ali "NAO" so dizia que nao
 * havia rateio, sem dizer onde o custo caia. Aqui o destino e sempre explicito.
 */
public enum CostAllocationType {

    /** Rateado entre centros de custo (setores). Exige itens que somem o total. */
    APPORTIONED,

    /**
     * Custo integral da empresa (CNPJ) do contrato, sem divisao por centro de
     * custo. Nao admite itens de rateio.
     */
    ENTERPRISE
}
