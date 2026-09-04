package com.unimedvargina.UnimedVarginhaTi.modules.financial.model;

import com.unimedvargina.UnimedVarginhaTi.shared.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Nota fiscal de um contrato em um mes de competencia.
 *
 * <p>Um contrato representa um servico e gera UMA nota por mes -- e a regra do
 * setor. A unicidade (contrato, competencia) esta no banco: a planilha nao
 * conseguia impedir a mesma nota lancada duas vezes.
 */
@Entity
@Table(
        name = "invoices",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_invoices_contract_competence",
                columnNames = {"contract_id", "competence"}
        )
)
@Getter @Setter @NoArgsConstructor
public class Invoice extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "contract_id", nullable = false)
    private Contract contract;

    /**
     * Numero da nota. E texto porque no historico existem numeros como
     * "2021/231" e "2023/1141", que nao cabem em um inteiro.
     */
    @Column(nullable = false)
    private String number;

    /**
     * Mes de referencia, sempre no dia 1.
     *
     * <p>Nao se deduz da emissao: no historico ha nota emitida em 12/04 e vencida
     * em 15/05 que pertence ao controle de MAIO. Derivar do mes de emissao a
     * jogaria no mes errado.
     */
    @Column(nullable = false)
    private LocalDate competence;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false)
    private LocalDate issueDate;

    @Column(nullable = false)
    private LocalDate dueDate;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private InvoiceStatus status;

    /**
     * Destino do custo: rateado entre centros de custo, ou integral no CNPJ do
     * contrato. Toda nota tem um -- e o que garante que nenhum gasto fique sem
     * dono na hora de somar por empresa ou por centro de custo.
     */
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private CostAllocationType costAllocation;

    /** Para quem a nota vai. O TI entrega ao Suporte Adm, que repassa ao Financeiro. */
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private InvoiceDeliveryTarget deliveryTarget;

    /**
     * Ate quando o TI precisa entregar. Calculado a partir do vencimento pelo
     * InvoiceDeliveryScheduler, mas GRAVADO e editavel: em semana de feriado o
     * calendario manda antecipar, e o sistema nao conhece os feriados.
     */
    @Column(nullable = false)
    private LocalDate deliveryDeadline;

    /** Quando foi efetivamente entregue. Nulo enquanto nao saiu do TI. */
    private LocalDate deliveredAt;

}
