package com.unimedvargina.UnimedVarginhaTi.modules.dashboard.service;

import com.unimedvargina.UnimedVarginhaTi.modules.dashboard.dto.PrintersDashboardDTO;
import com.unimedvargina.UnimedVarginhaTi.modules.printers.dto.ClosingDTO;
import com.unimedvargina.UnimedVarginhaTi.modules.printers.model.PrinterReading;
import com.unimedvargina.UnimedVarginhaTi.modules.printers.repository.PrinterReadingRepository;
import com.unimedvargina.UnimedVarginhaTi.modules.printers.service.PrinterClosingService;
import com.unimedvargina.UnimedVarginhaTi.shared.model.Enterprise;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;

/**
 * Numeros do painel de impressoras.
 *
 * <p>Reproduz a aba de graficos da planilha, que compara empresa por empresa e cor
 * por cor. O rateio por centro de custo vive aqui, e nao no painel de contratos:
 * ele nao e gasto do TI, e a cobranca que o TI repassa aos outros setores.
 *
 * <p>Como no painel de contratos, nada e gravado -- corrigir uma contagem corrige
 * o grafico no mesmo instante.
 */
@Service
public class PrintersDashboardService {

    @Autowired
    private PrinterReadingRepository readingRepository;

    @Autowired
    private PrinterClosingService closingService;

    public PrintersDashboardDTO build(LocalDate competence, int months) {
        LocalDate mes = YearMonth.from(competence).atDay(1);
        int janela = Math.max(1, Math.min(months, 24));

        List<LocalDate> meses = new ArrayList<>();
        for (int i = janela - 1; i >= 0; i--) {
            meses.add(mes.minusMonths(i));
        }

        List<PrintersDashboardDTO.MonthPagesDTO> paginas = new ArrayList<>();
        List<PrintersDashboardDTO.MonthValueDTO> custos = new ArrayList<>();

        // Uma linha por empresa e por mes. A empresa que so aparece em alguns meses
        // recebe zero nos demais: a serie precisa ter o mesmo tamanho do eixo.
        Map<UUID, String> nomes = new LinkedHashMap<>();
        Map<UUID, int[]> pretasPorEmpresa = new LinkedHashMap<>();
        Map<UUID, int[]> coresPorEmpresa = new LinkedHashMap<>();

        for (int i = 0; i < meses.size(); i++) {
            LocalDate ponto = meses.get(i);
            int preto = 0;
            int cor = 0;

            for (PrinterReading leitura : readingRepository.findByCompetence(ponto)) {
                int p = leitura.blackConsumption();
                int c = leitura.colorConsumption();
                preto += p;
                cor += c;

                Enterprise empresa = leitura.getPrinter().getEnterprise();
                if (empresa == null) continue;

                nomes.putIfAbsent(empresa.getId(), empresa.getName());
                pretasPorEmpresa.computeIfAbsent(empresa.getId(), k -> new int[meses.size()])[i] += p;
                coresPorEmpresa.computeIfAbsent(empresa.getId(), k -> new int[meses.size()])[i] += c;
            }

            paginas.add(new PrintersDashboardDTO.MonthPagesDTO(ponto, preto, cor));
            custos.add(new PrintersDashboardDTO.MonthValueDTO(ponto, custoDoMes(ponto)));
        }

        List<PrintersDashboardDTO.EnterpriseSeriesDTO> porEmpresa = nomes.entrySet().stream()
                .map(e -> new PrintersDashboardDTO.EnterpriseSeriesDTO(
                        e.getKey(), e.getValue(),
                        lista(pretasPorEmpresa.get(e.getKey()), meses.size()),
                        lista(coresPorEmpresa.get(e.getKey()), meses.size())))
                .sorted(Comparator.comparing(PrintersDashboardDTO.EnterpriseSeriesDTO::enterpriseName,
                        String.CASE_INSENSITIVE_ORDER))
                .toList();

        PrintersDashboardDTO.MonthPagesDTO atual = paginas.get(paginas.size() - 1);
        PrintersDashboardDTO.MonthPagesDTO anterior = paginas.size() > 1
                ? paginas.get(paginas.size() - 2)
                : null;

        return new PrintersDashboardDTO(
                mes,
                montarKpis(mes, atual, anterior, custos),
                paginas,
                custos,
                porEmpresa,
                centrosDeCusto(mes)
        );
    }

    private static List<Integer> lista(int[] valores, int tamanho) {
        List<Integer> saida = new ArrayList<>(tamanho);
        for (int i = 0; i < tamanho; i++) {
            saida.add(valores == null ? 0 : valores[i]);
        }
        return saida;
    }

    private PrintersDashboardDTO.KpisDTO montarKpis(
            LocalDate mes,
            PrintersDashboardDTO.MonthPagesDTO atual,
            PrintersDashboardDTO.MonthPagesDTO anterior,
            List<PrintersDashboardDTO.MonthValueDTO> custos) {

        BigDecimal custoAtual = custos.get(custos.size() - 1).value();
        BigDecimal custoAnterior = custos.size() > 1 ? custos.get(custos.size() - 2).value() : null;

        BigDecimal diferenca = custoAnterior == null ? null : custoAtual.subtract(custoAnterior);
        BigDecimal percentual = (custoAnterior == null || custoAnterior.compareTo(BigDecimal.ZERO) == 0)
                ? null
                : custoAtual.subtract(custoAnterior)
                    .multiply(BigDecimal.valueOf(100))
                    .divide(custoAnterior, 2, RoundingMode.HALF_UP);

        int pretasAno = 0;
        int coresAno = 0;
        BigDecimal custoAno = BigDecimal.ZERO;
        for (int m = 1; m <= 12; m++) {
            LocalDate ponto = LocalDate.of(mes.getYear(), m, 1);
            for (PrinterReading leitura : readingRepository.findByCompetence(ponto)) {
                pretasAno += leitura.blackConsumption();
                coresAno += leitura.colorConsumption();
            }
            custoAno = custoAno.add(custoDoMes(ponto));
        }

        int pendentes = (int) readingRepository.findByCompetence(mes).stream()
                .filter(l -> !l.isInformed())
                .count();

        return new PrintersDashboardDTO.KpisDTO(
                atual.blackPages(), atual.colorPages(),
                anterior == null ? null : anterior.blackPages(),
                anterior == null ? null : anterior.colorPages(),
                custoAtual, custoAnterior, diferenca, percentual,
                pretasAno, coresAno, custoAno.setScale(2, RoundingMode.HALF_UP),
                mes.getYear(), pendentes);
    }

    /**
     * Custo do mes pelo fechamento. Mes sem preco de pagina definido nao e erro --
     * e mes ainda nao configurado, e o grafico mostra zero em vez de estourar.
     */
    private BigDecimal custoDoMes(LocalDate mes) {
        try {
            return closingService.calculate(mes).total().setScale(2, RoundingMode.HALF_UP);
        } catch (RuntimeException e) {
            return BigDecimal.ZERO;
        }
    }

    /** Rateio do mes, uma tabela por empresa. */
    private List<PrintersDashboardDTO.EnterpriseCostCentersDTO> centrosDeCusto(LocalDate mes) {
        List<ClosingDTO.SectorTotalDTO> setores;
        try {
            setores = closingService.calculate(mes).sectors();
        } catch (RuntimeException e) {
            return List.of();
        }

        Map<String, List<ClosingDTO.SectorTotalDTO>> porEmpresa = new LinkedHashMap<>();
        for (ClosingDTO.SectorTotalDTO setor : setores) {
            porEmpresa.computeIfAbsent(setor.enterpriseName(), k -> new ArrayList<>()).add(setor);
        }

        return porEmpresa.entrySet().stream()
                .map(entrada -> {
                    List<ClosingDTO.SectorTotalDTO> linhas = entrada.getValue();
                    BigDecimal total = linhas.stream()
                            .map(ClosingDTO.SectorTotalDTO::cost)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);

                    return new PrintersDashboardDTO.EnterpriseCostCentersDTO(
                            linhas.get(0).enterpriseId(),
                            entrada.getKey(),
                            total.setScale(2, RoundingMode.HALF_UP),
                            linhas.stream()
                                    .map(s -> new PrintersDashboardDTO.CostCenterDTO(
                                            s.sectorId(), s.sectorName(), s.costCenterCode(), s.pyramidCode(),
                                            s.blackPages(), s.colorPages(),
                                            s.cost().setScale(2, RoundingMode.HALF_UP)))
                                    .toList());
                })
                .toList();
    }
}
