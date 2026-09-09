package com.unimedvargina.UnimedVarginhaTi.modules.printers.service;

import com.unimedvargina.UnimedVarginhaTi.modules.printers.dto.ClosingDTO;
import com.unimedvargina.UnimedVarginhaTi.modules.printers.model.*;
import com.unimedvargina.UnimedVarginhaTi.modules.printers.repository.PrinterReadingRepository;
import com.unimedvargina.UnimedVarginhaTi.modules.printers.repository.PrintingEnterpriseTermsRepository;
import com.unimedvargina.UnimedVarginhaTi.modules.printers.repository.PrintingPriceRepository;
import com.unimedvargina.UnimedVarginhaTi.shared.exception.BusinessRuleException;
import com.unimedvargina.UnimedVarginhaTi.shared.model.Enterprise;
import com.unimedvargina.UnimedVarginhaTi.shared.model.Sector;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;

/**
 * Calcula o custo do mes a partir das leituras.
 *
 * <p>Reproduz a formula da planilha:
 *
 * <pre>
 *   custo preto = paginas pretas x preco da pagina preta
 *   custo cor   = SE paginas coloridas &lt;= limite da franquia
 *                 ENTAO valor da franquia
 *                 SENAO paginas coloridas x preco da pagina colorida
 *   total       = custo preto + custo cor + acrescimo fixo
 * </pre>
 *
 * <p>Nada aqui e gravado: o fechamento e sempre recalculado das leituras e da
 * vigencia de preco. Guardar o valor criaria uma segunda verdade que ficaria
 * velha assim que alguem corrigisse uma contagem.
 */
@Service
public class PrinterClosingService {

    private static final BigDecimal CEM = new BigDecimal("100");

    @Autowired
    private PrinterReadingRepository readingRepository;

    @Autowired
    private PrintingPriceRepository priceRepository;

    @Autowired
    private PrintingEnterpriseTermsRepository termsRepository;

    public ClosingDTO calculate(LocalDate competence) {
        LocalDate mes = YearMonth.from(competence).atDay(1);

        PrintingPrice price = priceRepository
                .findFirstByValidFromLessThanEqualOrderByValidFromDesc(mes)
                .orElseThrow(() -> new BusinessRuleException(
                        "Nenhum preço de página definido para " + YearMonth.from(mes) + "."));

        List<PrinterReading> readings = readingRepository.findByCompetence(mes);

        Map<UUID, int[]> paginasPorEmpresa = new LinkedHashMap<>();
        Map<UUID, Enterprise> empresas = new LinkedHashMap<>();
        Map<UUID, BigDecimal[]> paginasPorSetor = new LinkedHashMap<>();
        Map<UUID, Sector> setores = new LinkedHashMap<>();

        List<String> naoInformadas = new ArrayList<>();
        List<String> invertidas = new ArrayList<>();
        List<String> semRateio = new ArrayList<>();
        int paginasSemRateio = 0;

        for (PrinterReading reading : readings) {
            String serie = reading.getPrinter().getSerialNumber();

            if (!reading.isInformed()) naoInformadas.add(serie);
            if (reading.isInconsistent()) invertidas.add(serie);

            int preto = reading.blackConsumption();
            int cor = reading.colorConsumption();

            Enterprise empresa = reading.getPrinter().getEnterprise();
            empresas.putIfAbsent(empresa.getId(), empresa);
            int[] acumulado = paginasPorEmpresa.computeIfAbsent(empresa.getId(), k -> new int[2]);
            acumulado[0] += preto;
            acumulado[1] += cor;

            if (reading.getShares().isEmpty()) {
                semRateio.add(serie);
                paginasSemRateio += preto + cor;
                continue;
            }

            for (PrinterReadingShare share : reading.getShares()) {
                Sector setor = share.getSector();
                setores.putIfAbsent(setor.getId(), setor);

                BigDecimal fracao = share.getPercentage().divide(CEM, 8, RoundingMode.HALF_UP);
                BigDecimal[] soma = paginasPorSetor.computeIfAbsent(setor.getId(),
                        k -> new BigDecimal[]{BigDecimal.ZERO, BigDecimal.ZERO});

                soma[0] = soma[0].add(BigDecimal.valueOf(preto).multiply(fracao));
                soma[1] = soma[1].add(BigDecimal.valueOf(cor).multiply(fracao));
            }
        }

        List<ClosingDTO.EnterpriseTotalDTO> porEmpresa = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        for (Map.Entry<UUID, int[]> entrada : paginasPorEmpresa.entrySet()) {
            Enterprise empresa = empresas.get(entrada.getKey());
            int preto = entrada.getValue()[0];
            int cor = entrada.getValue()[1];

            Optional<PrintingEnterpriseTerms> terms = termsRepository
                    .findFirstByEnterpriseIdAndValidFromLessThanEqualOrderByValidFromDesc(empresa.getId(), mes);

            BigDecimal custoPreto = price.getBlackPageCost()
                    .multiply(BigDecimal.valueOf(preto))
                    .setScale(4, RoundingMode.HALF_UP);

            int limite = terms.map(PrintingEnterpriseTerms::getColorFranchiseLimit).orElse(0);
            BigDecimal valorFranquia = terms.map(PrintingEnterpriseTerms::getColorFranchiseValue)
                    .orElse(BigDecimal.ZERO);
            BigDecimal acrescimo = terms.map(PrintingEnterpriseTerms::getFixedCharge).orElse(BigDecimal.ZERO);
            boolean entraNoTotal = terms.map(PrintingEnterpriseTerms::isIncludedInTotal).orElse(true);

            // Ate o limite cobra-se a franquia; acima dela, pagina a pagina.
            boolean franquiaAplicada = limite > 0 && cor <= limite;
            BigDecimal custoCor = franquiaAplicada
                    ? valorFranquia
                    : price.getColorPageCost().multiply(BigDecimal.valueOf(cor)).setScale(4, RoundingMode.HALF_UP);

            BigDecimal totalEmpresa = custoPreto.add(custoCor).add(acrescimo)
                    .setScale(4, RoundingMode.HALF_UP);

            porEmpresa.add(new ClosingDTO.EnterpriseTotalDTO(
                    empresa.getId(), empresa.getName(), preto, cor,
                    custoPreto, custoCor, franquiaAplicada, acrescimo, totalEmpresa, entraNoTotal));

            if (entraNoTotal) {
                total = total.add(totalEmpresa);
            }
        }

        // O custo por setor usa o preco por pagina puro. A franquia e o acrescimo
        // fixo sao do contrato da empresa, e nao de um centro de custo especifico
        // -- por isso a soma dos setores nao fecha com o total da empresa quando
        // ha franquia. Deixar isso explicito evita a conta parecer errada.
        List<ClosingDTO.SectorTotalDTO> porSetor = paginasPorSetor.entrySet().stream()
                .map(e -> {
                    Sector setor = setores.get(e.getKey());
                    BigDecimal preto = e.getValue()[0];
                    BigDecimal cor = e.getValue()[1];
                    BigDecimal custo = preto.multiply(price.getBlackPageCost())
                            .add(cor.multiply(price.getColorPageCost()))
                            .setScale(4, RoundingMode.HALF_UP);

                    return new ClosingDTO.SectorTotalDTO(
                            setor.getId(), setor.getName(), setor.getCostCenterCode(),
                            preto.setScale(2, RoundingMode.HALF_UP),
                            cor.setScale(2, RoundingMode.HALF_UP),
                            custo);
                })
                .sorted(Comparator.comparing(ClosingDTO.SectorTotalDTO::sectorName, String.CASE_INSENSITIVE_ORDER))
                .toList();

        return new ClosingDTO(
                mes,
                price.getBlackPageCost(),
                price.getColorPageCost(),
                porEmpresa,
                porSetor,
                total.setScale(4, RoundingMode.HALF_UP),
                new ClosingDTO.PendenciesDTO(
                        naoInformadas.stream().sorted().toList(),
                        invertidas.stream().sorted().toList(),
                        semRateio.stream().sorted().toList(),
                        paginasSemRateio)
        );
    }
}
