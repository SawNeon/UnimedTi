package com.unimedvargina.UnimedVarginhaTi.modules.financial.service;

import org.springframework.stereotype.Component;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;

/**
 * Calcula ate quando o TI precisa entregar a nota, a partir do vencimento.
 *
 * <p>A regra vem do Calendario de Nota Fiscal do Financeiro somada ao caminho real
 * do setor:
 *
 * <ol>
 *   <li>Nota fixa negociada por contrato: enviar com no minimo <b>7 dias</b> de
 *       antecedencia do vencimento previsto.</li>
 *   <li>O Financeiro recebe as <b>segundas ate 15h</b> e paga na <b>segunda
 *       seguinte</b> ao recebimento.</li>
 *   <li>O TI nao entrega direto ao Financeiro: passa antes pelo Suporte Adm, que
 *       recebe nas <b>sextas ate 15h</b> e leva 2 a 3 dias para repassar.</li>
 * </ol>
 *
 * <p>Dai o encadeamento: acha-se a ultima segunda que ainda permite pagar antes do
 * vencimento, e recua-se para a sexta anterior, que e o prazo do TI.
 *
 * <p><b>Feriados nao sao tratados.</b> O calendario manda antecipar quando cai
 * feriado no dia de envio, mas isso exige uma tabela de feriados que o sistema nao
 * tem. Por isso o prazo calculado e uma SUGESTAO gravavel e editavel, e nao um
 * valor imposto: em semana de feriado alguem precisa antecipar na mao.
 */
@Component
public class InvoiceDeliveryScheduler {

    /** Antecedencia minima exigida para nota fixa de contrato. */
    private static final int MIN_DIAS_ANTES_DO_VENCIMENTO = 7;

    /** Da sexta do Suporte Adm ate a segunda do Financeiro. */
    private static final int DIAS_SUPORTE_ATE_FINANCEIRO = 3;

    /**
     * Segunda-feira em que o Financeiro precisa receber a nota para pagar a tempo.
     */
    public LocalDate financeIntakeDate(LocalDate dueDate) {
        LocalDate limite = dueDate.minusDays(MIN_DIAS_ANTES_DO_VENCIMENTO);
        return limite.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
    }

    /** Segunda-feira em que a nota seria efetivamente paga. */
    public LocalDate expectedPaymentDate(LocalDate dueDate) {
        return financeIntakeDate(dueDate).plusWeeks(1);
    }

    /**
     * Sexta-feira ate a qual o TI precisa entregar a nota ao Suporte Adm.
     *
     * <p>E o prazo que aparece na tela, equivalente a coluna ENTREGAR ATE da
     * planilha — mas calculado, e nao digitado a cada mes.
     */
    public LocalDate deliveryDeadline(LocalDate dueDate) {
        return financeIntakeDate(dueDate).minusDays(DIAS_SUPORTE_ATE_FINANCEIRO);
    }
}
