package com.unimedvargina.UnimedVarginhaTi.modules.dashboard.service;

import com.unimedvargina.UnimedVarginhaTi.modules.dashboard.dto.DashboardDTO;
import com.unimedvargina.UnimedVarginhaTi.modules.financial.model.Contract;
import com.unimedvargina.UnimedVarginhaTi.modules.financial.model.ContractStatus;
import com.unimedvargina.UnimedVarginhaTi.modules.financial.model.Invoice;
import com.unimedvargina.UnimedVarginhaTi.modules.financial.repository.ApportionmentRepository;
import com.unimedvargina.UnimedVarginhaTi.modules.financial.repository.ContractRepository;
import com.unimedvargina.UnimedVarginhaTi.modules.financial.repository.InvoiceRepository;
import com.unimedvargina.UnimedVarginhaTi.modules.printers.dto.ClosingDTO;
import com.unimedvargina.UnimedVarginhaTi.modules.printers.model.PrinterReading;
import com.unimedvargina.UnimedVarginhaTi.modules.printers.repository.PrinterReadingRepository;
import com.unimedvargina.UnimedVarginhaTi.modules.printers.service.PrinterClosingService;
import com.unimedvargina.UnimedVarginhaTi.shared.model.Sector;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;

/**
 * Numeros do painel de gestao.
 *
 * <p>Nada aqui e gravado: tudo e somado das notas e das leituras na hora da
 * consulta. Um painel com numeros gravados vira a terceira verdade -- a primeira
 * correcao de nota o deixaria mentindo, que e o problema da aba Valores da
 * planilha, mantida a mao.
 */
@Service
public class DashboardService {

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private ContractRepository contractRepository;

    @Autowired
    private ApportionmentRepository apportionmentRepository;

    @Autowired
    private PrinterReadingRepository readingRepository;

    @Autowired
    private PrinterClosingService closingService;

    /** Quantos setores aparecem no grafico antes do resto virar "Outros". */
    private static final int TOP_SETORES = 8;

    public DashboardDTO build(LocalDate competence, int months) {
        LocalDate mes = YearMonth.from(competence).atDay(1);
        int janela = Math.max(1, Math.min(months, 24));

        List<DashboardDTO.MonthPointDTO> serie = new ArrayList<>();
        List<DashboardDTO.MonthPagesDTO> paginas = new ArrayList<>();

        for (int i = janela - 1; i >= 0; i--) {
            LocalDate ponto = mes.minusMonths(i);

            BigDecimal contratos = custoDeContratos(ponto);
            BigDecimal impressoras = custoDeImpressoras(ponto);

            serie.add(new DashboardDTO.MonthPointDTO(
                    ponto, contratos, impressoras, contratos.add(impressoras)));

            int[] contagem = paginasDoMes(ponto);
            paginas.add(new DashboardDTO.MonthPagesDTO(ponto, contagem[0], contagem[1]));
        }

        DashboardDTO.MonthPointDTO atual = serie.get(serie.size() - 1);
        BigDecimal anterior = serie.size() > 1
                ? serie.get(serie.size() - 2).total()
                : null;

        return new DashboardDTO(
                mes,
                montarKpis(mes, atual, anterior),
                serie,
                porEmpresa(mes),
                porSetor(mes),
                paginas
        );
    }

    private DashboardDTO.KpisDTO montarKpis(LocalDate mes,
                                            DashboardDTO.MonthPointDTO atual,
                                            BigDecimal anterior) {
        List<Contract> contratos = contractRepository.findAll().stream()
                .filter(c -> c.getStatus() == ContractStatus.ACTIVE)
                .toList();

        int comNota = (int) contratos.stream()
                .filter(c -> invoiceRepository.findByContractIdAndCompetence(c.getId(), mes).isPresent())
                .count();

        BigDecimal diferenca = anterior == null ? null : atual.total().subtract(anterior);
        BigDecimal percentual = (anterior == null || anterior.compareTo(BigDecimal.ZERO) == 0)
                ? null
                : atual.total().subtract(anterior)
                    .multiply(BigDecimal.valueOf(100))
                    .divide(anterior, 2, RoundingMode.HALF_UP);

        int[] contagem = paginasDoMes(mes);

        return new DashboardDTO.KpisDTO(
                atual.total(), anterior, diferenca, percentual,
                contratos.size() - comNota, comNota,
                contagem[0], contagem[1]);
    }

    private BigDecimal custoDeContratos(LocalDate mes) {
        return contractRepository.findAll().stream()
                .map(c -> invoiceRepository.findByContractIdAndCompetence(c.getId(), mes))
                .filter(Optional::isPresent)
                .map(i -> i.get().getAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * Custo das impressoras no mes. Sem preco definido para a competencia o
     * fechamento nao existe, e o painel mostra zero em vez de estourar -- o mes
     * ainda nao configurado nao e erro.
     */
    private BigDecimal custoDeImpressoras(LocalDate mes) {
        try {
            ClosingDTO fechamento = closingService.calculate(mes);
            return fechamento.total().setScale(2, RoundingMode.HALF_UP);
        } catch (RuntimeException e) {
            return BigDecimal.ZERO;
        }
    }

    private int[] paginasDoMes(LocalDate mes) {
        int preto = 0;
        int cor = 0;
        for (PrinterReading leitura : readingRepository.findByCompetence(mes)) {
            preto += leitura.blackConsumption();
            cor += leitura.colorConsumption();
        }
        return new int[]{preto, cor};
    }

    /** Custo do mes por empresa: notas do contrato daquela empresa, mais impressoras. */
    private List<DashboardDTO.NamedValueDTO> porEmpresa(LocalDate mes) {
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

        try {
            for (ClosingDTO.EnterpriseTotalDTO e : closingService.calculate(mes).enterprises()) {
                if (!e.includedInTotal()) continue;
                nomes.putIfAbsent(e.enterpriseId(), e.enterpriseName());
                totais.merge(e.enterpriseId(), e.total(), BigDecimal::add);
            }
        } catch (RuntimeException ignored) {
            // Mes sem preco de impressao configurado: so os contratos entram.
        }

        return totais.entrySet().stream()
                .map(e -> new DashboardDTO.NamedValueDTO(
                        e.getKey(), nomes.get(e.getKey()), null,
                        e.getValue().setScale(2, RoundingMode.HALF_UP)))
                .sorted(Comparator.comparing(DashboardDTO.NamedValueDTO::value).reversed())
                .toList();
    }

    /**
     * Custo por centro de custo: rateio das notas mais rateio das impressoras.
     *
     * <p>Acima de {@value #TOP_SETORES} o restante vira "Outros" -- mais barras que
     * isso deixam de ser comparaveis e viram uma lista colorida.
     */
    private List<DashboardDTO.NamedValueDTO> porSetor(LocalDate mes) {
        Map<UUID, BigDecimal> totais = new LinkedHashMap<>();
        Map<UUID, Sector> setores = new LinkedHashMap<>();

        for (Contract contrato : contractRepository.findAll()) {
            invoiceRepository.findByContractIdAndCompetence(contrato.getId(), mes).ifPresent(nota ->
                    apportionmentRepository.findByInvoiceId(nota.getId()).forEach(rateio -> {
                        setores.putIfAbsent(rateio.getSector().getId(), rateio.getSector());
                        totais.merge(rateio.getSector().getId(), rateio.getAllocation(), BigDecimal::add);
                    }));
        }

        try {
            for (ClosingDTO.SectorTotalDTO s : closingService.calculate(mes).sectors()) {
                totais.merge(s.sectorId(), s.cost(), BigDecimal::add);
                if (!setores.containsKey(s.sectorId())) {
                    Sector marcador = new Sector();
                    marcador.setName(s.sectorName());
                    marcador.setCostCenterCode(s.costCenterCode());
                    setores.put(s.sectorId(), marcador);
                }
            }
        } catch (RuntimeException ignored) {
            // idem: mes sem preco configurado
        }

        List<DashboardDTO.NamedValueDTO> ordenado = totais.entrySet().stream()
                .map(e -> new DashboardDTO.NamedValueDTO(
                        e.getKey(),
                        setores.get(e.getKey()).getName(),
                        setores.get(e.getKey()).getCostCenterCode(),
                        e.getValue().setScale(2, RoundingMode.HALF_UP)))
                .sorted(Comparator.comparing(DashboardDTO.NamedValueDTO::value).reversed())
                .toList();

        if (ordenado.size() <= TOP_SETORES) {
            return ordenado;
        }

        List<DashboardDTO.NamedValueDTO> recortado =
                new ArrayList<>(ordenado.subList(0, TOP_SETORES));

        BigDecimal resto = ordenado.subList(TOP_SETORES, ordenado.size()).stream()
                .map(DashboardDTO.NamedValueDTO::value)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        recortado.add(new DashboardDTO.NamedValueDTO(null, "Outros", null, resto));
        return recortado;
    }
}
