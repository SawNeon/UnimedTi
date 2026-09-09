package com.unimedvargina.UnimedVarginhaTi.modules.financial.model;

/**
 * Para quem a nota e entregue, conforme o Calendario de Nota Fiscal.
 *
 * <p>O TI trabalha com notas fixas negociadas por contrato, que vao para o Suporte
 * Adm. O caminho direto ao Financeiro existe para reembolso, adiantamento, ordem
 * de compra autorizada, comissao e seguros -- por isso os dois valores.
 */
public enum InvoiceDeliveryTarget {

    /** Recebe as sextas ate 15h. Caminho das notas fixas de contrato. */
    SUPORTE_ADM,

    /** Recebe as segundas ate 15h. */
    FINANCEIRO
}
