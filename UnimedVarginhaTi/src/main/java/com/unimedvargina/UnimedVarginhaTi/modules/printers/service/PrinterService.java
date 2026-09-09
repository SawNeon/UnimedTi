package com.unimedvargina.UnimedVarginhaTi.modules.printers.service;

import com.unimedvargina.UnimedVarginhaTi.modules.printers.dto.PrinterRequestDTO;
import com.unimedvargina.UnimedVarginhaTi.modules.printers.dto.PrinterResponseDTO;
import com.unimedvargina.UnimedVarginhaTi.modules.printers.model.Printer;
import com.unimedvargina.UnimedVarginhaTi.modules.printers.model.PrinterSectorShare;
import com.unimedvargina.UnimedVarginhaTi.modules.printers.repository.PrinterReadingRepository;
import com.unimedvargina.UnimedVarginhaTi.modules.printers.repository.PrinterRepository;
import com.unimedvargina.UnimedVarginhaTi.shared.exception.BusinessRuleException;
import com.unimedvargina.UnimedVarginhaTi.shared.exception.ResourceNotFoundException;
import com.unimedvargina.UnimedVarginhaTi.shared.model.Enterprise;
import com.unimedvargina.UnimedVarginhaTi.shared.model.Sector;
import com.unimedvargina.UnimedVarginhaTi.shared.repository.EnterpriseRepository;
import com.unimedvargina.UnimedVarginhaTi.shared.repository.SectorRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

/**
 * Cadastro do parque de impressoras e do rateio de cada uma.
 *
 * <p>Equivale a aba BD da planilha, com uma diferenca: o percentual do rateio e
 * validado. Na planilha nada impedia uma impressora somar 90% ou 130% entre os
 * setores, e o erro so aparecia no fim, no valor rateado.
 */
@Service
public class PrinterService {

    private static final BigDecimal CEM = new BigDecimal("100.0000");

    @Autowired
    private PrinterRepository repository;

    @Autowired
    private PrinterReadingRepository readingRepository;

    @Autowired
    private EnterpriseRepository enterpriseRepository;

    @Autowired
    private SectorRepository sectorRepository;

    public List<PrinterResponseDTO> listAll() {
        return repository.findAll().stream()
                .sorted(Comparator.comparing(Printer::getSerialNumber, String.CASE_INSENSITIVE_ORDER))
                .map(PrinterResponseDTO::from)
                .toList();
    }

    public Printer findById(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Impressora", id));
    }

    @Transactional
    public PrinterResponseDTO create(PrinterRequestDTO request) {
        repository.findBySerialNumber(request.serialNumber().trim())
                .ifPresent(existing -> {
                    throw new BusinessRuleException(
                            "Já existe uma impressora com a série " + existing.getSerialNumber() + ".");
                });

        Printer printer = new Printer();
        apply(printer, request);
        return PrinterResponseDTO.from(repository.save(printer));
    }

    @Transactional
    public PrinterResponseDTO update(UUID id, PrinterRequestDTO request) {
        Printer printer = findById(id);

        repository.findBySerialNumber(request.serialNumber().trim())
                .filter(other -> !other.getId().equals(id))
                .ifPresent(other -> {
                    throw new BusinessRuleException(
                            "Já existe outra impressora com a série " + other.getSerialNumber() + ".");
                });

        apply(printer, request);
        return PrinterResponseDTO.from(repository.save(printer));
    }

    /**
     * Impressora com leitura lancada nao e excluida: o historico de consumo e a
     * base do rateio ja cobrado. Para tirar de circulacao, marque como inativa.
     */
    @Transactional
    public void delete(UUID id) {
        Printer printer = findById(id);

        boolean temLeitura = !readingRepository.findAll().stream()
                .filter(r -> r.getPrinter().getId().equals(id))
                .toList().isEmpty();

        if (temLeitura) {
            throw new BusinessRuleException(
                    "A impressora %s tem leituras lançadas e não pode ser excluída. Marque-a como inativa."
                            .formatted(printer.getSerialNumber()));
        }

        repository.delete(printer);
    }

    private void apply(Printer printer, PrinterRequestDTO request) {
        Enterprise enterprise = enterpriseRepository.findById(request.enterpriseId())
                .orElseThrow(() -> new ResourceNotFoundException("Empresa", request.enterpriseId()));

        printer.setSerialNumber(request.serialNumber().trim());
        printer.setAssetTag(trimOrNull(request.assetTag()));
        printer.setModel(trimOrNull(request.model()));
        printer.setIpAddress(trimOrNull(request.ipAddress()));
        printer.setEnterprise(enterprise);
        printer.setAutoRead(request.autoRead());
        printer.setBackup(request.backup());
        printer.setActive(request.active());

        applyShares(printer, request.shares());
    }

    /**
     * Substitui o rateio inteiro. Vindo vazio, a impressora fica sem rateio
     * definido -- o caso da reserva antes de ser usada. Vindo preenchido, a soma
     * tem de fechar 100.
     */
    private void applyShares(Printer printer, List<PrinterRequestDTO.ShareDTO> shares) {
        printer.getShares().clear();

        if (shares == null || shares.isEmpty()) {
            return;
        }

        Set<UUID> vistos = new HashSet<>();
        BigDecimal total = BigDecimal.ZERO;

        for (PrinterRequestDTO.ShareDTO item : shares) {
            if (!vistos.add(item.sectorId())) {
                throw new BusinessRuleException("O mesmo setor aparece mais de uma vez no rateio.");
            }

            Sector sector = sectorRepository.findById(item.sectorId())
                    .orElseThrow(() -> new ResourceNotFoundException("Setor", item.sectorId()));

            printer.getShares().add(new PrinterSectorShare(printer, sector, item.percentage()));
            total = total.add(item.percentage());
        }

        if (total.compareTo(CEM) != 0) {
            throw new BusinessRuleException(
                    "A soma do rateio da impressora é %s%%, e precisa ser 100%%."
                            .formatted(total.stripTrailingZeros().toPlainString()));
        }
    }

    private String trimOrNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
