package com.unimedvargina.UnimedVarginhaTi.modules.financial.model;

/**
 * Resultado da comparacao do valor da nota com o mes anterior.
 *
 * <p>Substitui a coluna COMPARATIVO da planilha. E sempre CALCULADO na consulta,
 * nunca gravado: a planilha guardava o valor anterior porque nao conseguia
 * busca-lo, mas guardar aqui criaria uma segunda copia que fica desatualizada
 * quando a nota do mes passado e corrigida.
 */
public enum InvoiceComparison {
    /** A nota do mes ainda nao chegou. Equivale ao "PREENCHER" da planilha. */
    PENDENTE,
    /** Primeira nota deste contrato: nao ha mes anterior para comparar. */
    PRIMEIRA,
    MANTEVE,
    AUMENTOU,
    DIMINUIU
}
