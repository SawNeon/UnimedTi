package com.unimedvargina.UnimedVarginhaTi.modules.dashboard.service;

import com.unimedvargina.UnimedVarginhaTi.modules.dashboard.dto.ContractsDashboardDTO;
import com.unimedvargina.UnimedVarginhaTi.modules.financial.model.Contract;
import com.unimedvargina.UnimedVarginhaTi.modules.financial.model.ContractStatus;
import com.unimedvargina.UnimedVarginhaTi.modules.financial.model.Invoice;
import com.unimedvargina.UnimedVarginhaTi.modules.financial.repository.ContractRepository;
import com.unimedvargina.UnimedVarginhaTi.modules.financial.repository.InvoiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;

/**
 * Numeros do painel de contratos.
 *
 * <p>Nada e gravado: tudo sai das notas na hora da consulta. Um painel com numeros
 * gravados vira a terceira verdade -- a primeira correcao de nota o deixaria
 * mentindo, que e exatamente o problema da aba Valores da planilha, mantida a mao.
 *
 * <p>O custo das impressoras nao e somado aqui por fora. A Printec fatura, a nota
 * e lancada no contrato dela e ja entra por essa porta; somar tambem o fechamento
 * contaria o mesmo dinheiro duas vezes.
 */
@Service
public class ContractsDashboardService {

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private ContractRepository contractRepository;

    public ContractsDashboardDTO build(LocalDate competence, int months) {
        LocalDate mes = YearMonth.from(competence).atDay(1);
        int janela = Math.max(1, Math.min(months, 24));

        List<ContractsDashboardDTO.MonthValueDTO> serie = new ArrayList<>();
        for (int i = janela - 1; i >= 0; i--) {
            LocalDate ponto = mes.minusMonths(i);
            serie.add(new ContractsDashboardDTO.MonthValueDTO(ponto, custoDoMes(ponto)));
        }

        BigDecimal atual = serie.get(serie.size() - 1).value();
        BigDecimal anterior = serie.size() > 1 ? serie.get(serie.size() - 2).value() : null;

        return new ContractsDashboardDTO(
                mes,
                montarKpis(mes, atual, anterior),
                serie,
                porEmpresa(mes),
                porCategoria(mes.getYear())
        );
    }

    private ContractsDashboardDTO.KpisDTO montarKpis(LocalDate mes,
                                                     BigDecimal atual,
                                                     BigDecimal anterior) {
        List<Contract> ativos = contractRepository.findAll().stream()
                .filter(c -> c.getStatus() == ContractStatus.ACTIVE)
                .toList();

        int comNota = (int) ativos.stream()
                .filter(c -> invoiceRepository.findByContractIdAndCompetence(c.getId(), mes).isPresent())
                .count();

        BigDecimal diferenca = anterior == null ? null : atual.subtract(anterior);
        BigDecimal percentual = (anterior == null || anterior.compareTo(BigDecimal.ZERO) == 0)
                ? null
                : atual.subtract(anterior)
                    .multiply(BigDecimal.valueOf(100))
                    .divide(anterior, 2, RoundingMode.HALF_UP);

        return new ContractsDashboardDTO.KpisDTO(
                atual, anterior, diferenca, percentual,
                ativos.size() - comNota, comNota,
                totalDoAno(mes.getYear()), mes.getYear());
    }

    private BigDecimal custoDoMes(LocalDate mes) {
        return contractRepository.findAll().stream()
                .map(c -> invoiceRepository.findByContractIdAndCompetence(c.getId(), mes))
                .filter(Optional::isPresent)
                .map(i -> i.get().getAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);
    }

    /** Soma do ano inteiro: e o "custo do TI no ano" que o painel mostra em destaque. */
    private BigDecimal totalDoAno(int ano) {
        BigDecimal total = BigDecimal.ZERO;
        for (int mes = 1; mes <= 12; mes++) {
            total = total.add(custoDoMes(LocalDate.of(ano, mes, 1)));
        }
        return total.setScale(2, RoundingMode.HALF_UP);
    }

    /** Custo do mes por empresa: as notas dos contratos daquele CNPJ. */
    private List<ContractsDashboardDTO.NamedValueDTO> porEmpresa(LocalDate mes) {
        Map<UUID, BigDecimal> totais = new LinkedHashMap<>();
        Map<UUID, String> nomes = new LinkedHashMap<>();

        for (Contract contrato : contractRepository.findAll()) {
            Optional<Invoice> nota = invoiceRepository.findByContractIdAndCompetence(contrato.getId(), mes);
            if (nota.isEmpty() || contrato.getEnterprise() == null) {
                continue;
            }

            UUID id = contrato.getEnterprise().getId();
            nomes.putIfAbsent(id, contrato.getEnterprise().getName());
            totais.merge(id, nota.get().getAmount(), BigDecimal::add);
        }

        return totais.entrySet().stream()
                .map(e -> new ContractsDashboardDTO.NamedValueDTO(
                        e.getKey(), nomes.get(e.getKey()),
                        e.getValue().setScale(2, RoundingMode.HALF_UP)))
                .sorted(Comparator.comparing(ContractsDashboardDTO.NamedValueDTO::value).reversed())
                .toList();
    }

    /** Gasto do ano por categoria de servico -- a coluna TIPO da planilha de notas. */
    private List<ContractsDashboardDTO.NamedValueDTO> porCategoria(int ano) {
        Map<String, BigDecimal> totais = new LinkedHashMap<>();

        for (Contract contrato : contractRepository.findAll()) {
            String categoria = contrato.getServiceType() == null || contrato.getServiceType().isBlank()
                    ? "Sem categoria"
                    : contrato.getServiceType().trim();

            for (int mes = 1; mes <= 12; mes++) {
                LocalDate competencia = LocalDate.of(ano, mes, 1);
                invoiceRepository.findByContractIdAndCompetence(contrato.getId(), competencia)
                        .ifPresent(nota -> totais.merge(categoria, nota.getAmount(), BigDecimal::add));
            }
        }

        return totais.entrySet().stream()
                .map(e -> new ContractsDashboardDTO.NamedValueDTO(
                        null, e.getKey(), e.getValue().setScale(2, RoundingMode.HALF_UP)))
                .sorted(Comparator.comparing(ContractsDashboardDTO.NamedValueDTO::value).reversed())
                .toList();
    }
}
