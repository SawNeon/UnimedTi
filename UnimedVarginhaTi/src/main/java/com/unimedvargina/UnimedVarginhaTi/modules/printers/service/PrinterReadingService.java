package com.unimedvargina.UnimedVarginhaTi.modules.printers.service;

import com.unimedvargina.UnimedVarginhaTi.modules.printers.dto.ImportResultDTO;
import com.unimedvargina.UnimedVarginhaTi.modules.printers.dto.ReadingResponseDTO;
import com.unimedvargina.UnimedVarginhaTi.modules.printers.dto.ReadingUpdateDTO;
import com.unimedvargina.UnimedVarginhaTi.modules.printers.model.*;
import com.unimedvargina.UnimedVarginhaTi.modules.printers.repository.PrinterReadingRepository;
import com.unimedvargina.UnimedVarginhaTi.modules.printers.repository.PrinterRepository;
import com.unimedvargina.UnimedVarginhaTi.shared.exception.BusinessRuleException;
import com.unimedvargina.UnimedVarginhaTi.shared.exception.ResourceNotFoundException;
import com.unimedvargina.UnimedVarginhaTi.shared.model.Sector;
import com.unimedvargina.UnimedVarginhaTi.shared.repository.SectorRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;

/**
 * Fechamento mensal das impressoras.
 *
 * <p>Substitui o gesto de copiar a aba do mes anterior. Abrir a competencia cria
 * uma leitura por impressora ativa, ja com o contador inicial vindo do fechamento
 * anterior -- assim o mes novo nunca nasce com o inicial de outro mes por engano.
 */
@Service
public class PrinterReadingService {

    private static final BigDecimal CEM = new BigDecimal("100.0000");

    @Autowired
    private PrinterReadingRepository repository;

    @Autowired
    private PrinterRepository printerRepository;

    @Autowired
    private SectorRepository sectorRepository;

    @Autowired
    private PrintWayImporter importer;

    public List<ReadingResponseDTO> listByCompetence(LocalDate competence) {
        return repository.findByCompetence(normalizar(competence)).stream()
                .sorted(Comparator.comparing(r -> r.getPrinter().getSerialNumber(),
                        String.CASE_INSENSITIVE_ORDER))
                .map(ReadingResponseDTO::from)
                .toList();
    }

    /**
     * Abre o mes: uma leitura por impressora ativa, com o contador inicial vindo do
     * fechamento anterior e o rateio copiado do padrao da impressora.
     *
     * <p>Reexecutar e seguro -- impressora que ja tem leitura no mes e ignorada, o
     * que permite abrir o mes de novo depois de cadastrar uma impressora nova.
     */
    @Transactional
    public List<ReadingResponseDTO> openCompetence(LocalDate competence) {
        LocalDate mes = normalizar(competence);
        LocalDate anterior = mes.minusMonths(1);

        for (Printer printer : printerRepository.findByActiveTrue()) {
            if (repository.findByPrinterIdAndCompetence(printer.getId(), mes).isPresent()) {
                continue;
            }

            PrinterReading reading = new PrinterReading();
            reading.setPrinter(printer);
            reading.setCompetence(mes);
            reading.setSource(printer.isAutoRead() ? ReadingSource.PRINTWAY : ReadingSource.MANUAL);

            repository.findByPrinterIdAndCompetence(printer.getId(), anterior).ifPresent(previa -> {
                reading.setBlackStart(previa.getBlackEnd());
                reading.setColorStart(previa.getColorEnd());
            });

            // O final comeca igual ao inicial: consumo zero ate alguem informar.
            reading.setBlackEnd(reading.getBlackStart());
            reading.setColorEnd(reading.getColorStart());

            copiarRateioPadrao(printer, reading);

            repository.save(reading);
        }

        return listByCompetence(mes);
    }

    /**
     * Importa o relatorio do PrintWay e preenche o contador final pela serie.
     *
     * <p>O que NAO entrou e devolvido junto: serie fora do cadastro e impressora
     * ativa que o arquivo nao trouxe. Na planilha essas duas situacoes passavam
     * despercebidas e o mes fechava incompleto.
     */
    @Transactional
    public ImportResultDTO importPrintWay(LocalDate competence, MultipartFile arquivo) {
        LocalDate mes = normalizar(competence);
        List<PrintWayImporter.Linha> linhas = importer.ler(arquivo);

        List<String> desconhecidas = new ArrayList<>();
        List<String> inconsistentes = new ArrayList<>();
        Set<UUID> atualizadas = new HashSet<>();

        for (PrintWayImporter.Linha linha : linhas) {
            Optional<Printer> printer = printerRepository.findBySerialNumber(linha.serialNumber());

            if (printer.isEmpty()) {
                desconhecidas.add(linha.serialNumber());
                continue;
            }

            PrinterReading reading = repository
                    .findByPrinterIdAndCompetence(printer.get().getId(), mes)
                    .orElseThrow(() -> new BusinessRuleException(
                            "Abra a competência antes de importar: a impressora %s não tem leitura em %s."
                                    .formatted(linha.serialNumber(), YearMonth.from(mes))));

            if (linha.pretoFim() != null) reading.setBlackEnd(linha.pretoFim());
            if (linha.corFim() != null) reading.setColorEnd(linha.corFim());
            if (linha.a3Preto() != null) reading.setA3Black(linha.a3Preto());
            if (linha.a3Color() != null) reading.setA3Color(linha.a3Color());

            // Reimportar sobre uma leitura ja corrigida a mao desfaria a correcao
            // sem aviso; a marca permanece para a divergencia ficar visivel.
            reading.setSource(ReadingSource.PRINTWAY);
            reading.setInformed(true);

            repository.save(reading);
            atualizadas.add(printer.get().getId());

            if (reading.isInconsistent()) {
                inconsistentes.add(linha.serialNumber());
            }
        }

        List<String> semLeitura = repository.findByCompetence(mes).stream()
                .filter(r -> !atualizadas.contains(r.getPrinter().getId()))
                .map(r -> r.getPrinter().getSerialNumber())
                .sorted()
                .toList();

        return new ImportResultDTO(
                linhas.size(), atualizadas.size(), desconhecidas, semLeitura, inconsistentes);
    }

    /**
     * Lancamento manual ou correcao. Ajustar um numero que veio do PrintWay marca a
     * leitura como corrigida, em vez de apagar de onde o dado veio.
     */
    @Transactional
    public ReadingResponseDTO update(UUID id, ReadingUpdateDTO request) {
        PrinterReading reading = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Leitura", id));

        boolean mudouNumero =
                !Objects.equals(reading.getBlackEnd(), request.blackEnd())
                        || !Objects.equals(reading.getColorEnd(), request.colorEnd())
                        || !Objects.equals(reading.getBlackStart(), request.blackStart())
                        || !Objects.equals(reading.getColorStart(), request.colorStart());

        if (mudouNumero && reading.getSource() == ReadingSource.PRINTWAY) {
            reading.setCorrected(true);
        }

        reading.setBlackStart(request.blackStart());
        reading.setBlackEnd(request.blackEnd());
        reading.setColorStart(request.colorStart());
        reading.setColorEnd(request.colorEnd());
        reading.setA3Black(request.a3Black() == null ? 0 : request.a3Black());
        reading.setA3Color(request.a3Color() == null ? 0 : request.a3Color());
        reading.setNotes(request.notes());
        reading.setInformed(true);

        if (request.shares() != null) {
            aplicarRateio(reading, request.shares());
        }

        return ReadingResponseDTO.from(repository.save(reading));
    }

    private void copiarRateioPadrao(Printer printer, PrinterReading reading) {
        for (PrinterSectorShare padrao : printer.getShares()) {
            reading.getShares().add(new PrinterReadingShare(
                    reading, padrao.getSector(), padrao.getPercentage()));
        }
    }

    /**
     * Substitui o rateio do mes. Vazio deixa a impressora sem rateio -- o caso da
     * reserva antes de ser usada. Preenchido, a soma tem de fechar 100.
     */
    private void aplicarRateio(PrinterReading reading, List<ReadingUpdateDTO.ShareDTO> shares) {
        reading.getShares().clear();

        if (shares.isEmpty()) {
            return;
        }

        Set<UUID> vistos = new HashSet<>();
        BigDecimal total = BigDecimal.ZERO;

        for (ReadingUpdateDTO.ShareDTO item : shares) {
            if (!vistos.add(item.sectorId())) {
                throw new BusinessRuleException("O mesmo setor aparece mais de uma vez no rateio.");
            }

            Sector sector = sectorRepository.findById(item.sectorId())
                    .orElseThrow(() -> new ResourceNotFoundException("Setor", item.sectorId()));

            reading.getShares().add(new PrinterReadingShare(reading, sector, item.percentage()));
            total = total.add(item.percentage());
        }

        if (total.compareTo(CEM) != 0) {
            throw new BusinessRuleException(
                    "A soma do rateio é %s%%, e precisa ser 100%%."
                            .formatted(total.stripTrailingZeros().toPlainString()));
        }
    }

    private LocalDate normalizar(LocalDate competence) {
        return YearMonth.from(competence).atDay(1);
    }
}
