package com.unimedvargina.UnimedVarginhaTi.modules.financial.service;

import com.unimedvargina.UnimedVarginhaTi.modules.financial.dto.ContractResponseDTO;
import com.unimedvargina.UnimedVarginhaTi.modules.financial.model.Contract;
import com.unimedvargina.UnimedVarginhaTi.modules.financial.model.Invoice;
import com.unimedvargina.UnimedVarginhaTi.modules.financial.model.InvoiceComparison;
import com.unimedvargina.UnimedVarginhaTi.modules.financial.repository.ContractRepository;
import com.unimedvargina.UnimedVarginhaTi.modules.financial.repository.InvoiceRepository;
import com.unimedvargina.UnimedVarginhaTi.shared.exception.BusinessRuleException;
import com.unimedvargina.UnimedVarginhaTi.shared.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ContractService {

    @Autowired
    private ContractRepository  contractRepository;

    @Autowired
    private InvoiceRepository invoiceRepository;

    /**
     * A visao mensal: cada contrato com a nota do mes e a comparacao com o mes
     * anterior. E a aba do mes da planilha, com VL ANTERIOR, COMPARATIVO e
     * DIFERENCA calculados em vez de digitados.
     *
     * <p>Contrato sem nota no mes aparece como PENDENTE com o valor do mes passado
     * -- e a lista do que ainda falta chegar, que era o "PREENCHER" da planilha.
     */
    public Page<ContractResponseDTO> getContractsWithInvoiceByMonth(int page, int size, String monthStr) {
        LocalDate competence = parseCompetence(monthStr);
        LocalDate previousCompetence = competence.minusMonths(1);

        Page<Contract> contractsPage = contractRepository.findAll(PageRequest.of(page, size));

        return contractsPage.map(contract -> {
            Invoice current = invoiceRepository
                    .findByContractIdAndCompetence(contract.getId(), competence).orElse(null);
            BigDecimal previousAmount = invoiceRepository
                    .findByContractIdAndCompetence(contract.getId(), previousCompetence)
                    .map(Invoice::getAmount)
                    .orElse(null);

            ContractResponseDTO.InvoiceMonthDTO invoiceDTO = current == null ? null
                    : new ContractResponseDTO.InvoiceMonthDTO(
                            current.getId(),
                            current.getNumber(),
                            current.getAmount(),
                            current.getIssueDate(),
                            current.getDueDate(),
                            current.getStatus(),
                            current.getCostAllocation(),
                            current.getDeliveryTarget(),
                            current.getDeliveryDeadline(),
                            current.getDeliveredAt());

            BigDecimal currentAmount = current == null ? null : current.getAmount();

            return new ContractResponseDTO(
                    contract.getId(),
                    contract.getEnterprise() != null ? contract.getEnterprise().getName() : "Empresa não informada",
                    contract.getServiceType(),
                    contract.getServiceDescription(),
                    contract.getStatus(),
                    invoiceDTO,
                    previousAmount,
                    compare(currentAmount, previousAmount),
                    difference(currentAmount, previousAmount),
                    differencePercent(currentAmount, previousAmount)
            );
        });
    }

    private LocalDate parseCompetence(String monthStr) {
        try {
            return YearMonth.parse(monthStr).atDay(1);
        } catch (RuntimeException ex) {
            throw new BusinessRuleException(
                    "Competência inválida: \"%s\". Use o formato AAAA-MM, por exemplo 2026-09."
                            .formatted(monthStr));
        }
    }

    private InvoiceComparison compare(BigDecimal current, BigDecimal previous) {
        if (current == null) {
            return InvoiceComparison.PENDENTE;
        }
        if (previous == null) {
            return InvoiceComparison.PRIMEIRA;
        }

        int signal = current.compareTo(previous);
        if (signal > 0) return InvoiceComparison.AUMENTOU;
        if (signal < 0) return InvoiceComparison.DIMINUIU;
        return InvoiceComparison.MANTEVE;
    }

    private BigDecimal difference(BigDecimal current, BigDecimal previous) {
        if (current == null || previous == null) {
            return null;
        }
        return current.subtract(previous);
    }

    /**
     * Percentual sobre o mês anterior. Devolve nulo quando o anterior é zero: uma
     * divisão ali estouraria, e "aumentou infinito" não informa nada.
     */
    private BigDecimal differencePercent(BigDecimal current, BigDecimal previous) {
        if (current == null || previous == null || previous.compareTo(BigDecimal.ZERO) == 0) {
            return null;
        }
        return current.subtract(previous)
                .multiply(BigDecimal.valueOf(100))
                .divide(previous, 2, RoundingMode.HALF_UP);
    }

    public Contract save(Contract contract) { return contractRepository.save(contract); }

    public Contract findById(UUID id) {
        return contractRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contrato", id));
    }

    public List<Contract> findAll() { return contractRepository.findAll(); }

    public Contract update(Contract contract) { return contractRepository.save(contract); }

    public Page<Contract> getAllContractsPaginated(int page, int size) {
        return contractRepository.findAll(PageRequest.of(page, size));
    }
}
