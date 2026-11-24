package com.unimedvargina.UnimedVarginhaTi.modules.financial.service;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.DayOfWeek;
import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Verifica o prazo de entrega contra o Calendario de Nota Fiscal do Financeiro.
 *
 * <p>Errar aqui significa pagamento atrasado, entao os dois limites do calendario
 * sao checados como propriedade, para TODO vencimento possivel em tres anos, e nao
 * so em alguns exemplos escolhidos a dedo.
 */
class InvoiceDeliverySchedulerTest {

    private final InvoiceDeliveryScheduler scheduler = new InvoiceDeliveryScheduler();

    @Test
    @DisplayName("o prazo do TI cai sempre numa sexta-feira")
    void deadlineIsAlwaysFriday() {
        forEachDueDateOfThreeYears(dueDate ->
                assertThat(scheduler.deliveryDeadline(dueDate).getDayOfWeek())
                        .as("vencimento %s", dueDate)
                        .isEqualTo(DayOfWeek.FRIDAY));
    }

    @Test
    @DisplayName("o Financeiro sempre recebe numa segunda-feira")
    void financeIntakeIsAlwaysMonday() {
        forEachDueDateOfThreeYears(dueDate ->
                assertThat(scheduler.financeIntakeDate(dueDate).getDayOfWeek())
                        .as("vencimento %s", dueDate)
                        .isEqualTo(DayOfWeek.MONDAY));
    }

    @Test
    @DisplayName("regra do contrato: nunca menos de 7 dias de antecedencia")
    void alwaysRespectsSevenDayMinimum() {
        forEachDueDateOfThreeYears(dueDate -> {
            long dias = dueDate.toEpochDay() - scheduler.deliveryDeadline(dueDate).toEpochDay();
            assertThat(dias)
                    .as("dias de antecedencia para o vencimento %s", dueDate)
                    .isGreaterThanOrEqualTo(7);
        });
    }

    @Test
    @DisplayName("o pagamento nunca cai depois do vencimento")
    void paymentNeverLandsAfterDueDate() {
        forEachDueDateOfThreeYears(dueDate ->
                assertThat(scheduler.expectedPaymentDate(dueDate))
                        .as("pagamento para o vencimento %s", dueDate)
                        .isBeforeOrEqualTo(dueDate));
    }

    @Test
    @DisplayName("o prazo e o mais tarde possivel: uma semana depois ja atrasaria")
    void deadlineIsTheLatestThatStillPaysOnTime() {
        forEachDueDateOfThreeYears(dueDate -> {
            LocalDate umaSemanaDepois = scheduler.financeIntakeDate(dueDate).plusWeeks(1);
            assertThat(umaSemanaDepois.plusWeeks(1))
                    .as("adiar a entrega do vencimento %s atrasaria o pagamento", dueDate)
                    .isAfter(dueDate);
        });
    }

    @Test
    @DisplayName("exemplo concreto: vencimento 25/09/2026")
    void concreteExample() {
        LocalDate vencimento = LocalDate.of(2026, 9, 25);

        assertThat(scheduler.deliveryDeadline(vencimento)).isEqualTo(LocalDate.of(2026, 9, 11));
        assertThat(scheduler.financeIntakeDate(vencimento)).isEqualTo(LocalDate.of(2026, 9, 14));
        assertThat(scheduler.expectedPaymentDate(vencimento)).isEqualTo(LocalDate.of(2026, 9, 21));
    }

    private void forEachDueDateOfThreeYears(java.util.function.Consumer<LocalDate> assertion) {
        LocalDate data = LocalDate.of(2026, 1, 1);
        LocalDate fim = LocalDate.of(2028, 12, 31);
        while (!data.isAfter(fim)) {
            assertion.accept(data);
            data = data.plusDays(1);
        }
    }
}
