package com.unimedvargina.UnimedVarginhaTi.modules.financial.service;

import com.unimedvargina.UnimedVarginhaTi.modules.financial.dto.InvoiceApportionmentTemplateDTO;
import com.unimedvargina.UnimedVarginhaTi.modules.financial.dto.InvoiceRequestDTO;
import com.unimedvargina.UnimedVarginhaTi.modules.financial.dto.InvoiceResponseDTO;
import com.unimedvargina.UnimedVarginhaTi.modules.financial.model.Apportionment;
import com.unimedvargina.UnimedVarginhaTi.modules.financial.model.CostAllocationType;
import com.unimedvargina.UnimedVarginhaTi.modules.financial.model.Contract;
import com.unimedvargina.UnimedVarginhaTi.modules.financial.model.Invoice;
import com.unimedvargina.UnimedVarginhaTi.modules.financial.model.InvoiceStatus;
import com.unimedvargina.UnimedVarginhaTi.modules.financial.repository.ApportionmentRepository;
import com.unimedvargina.UnimedVarginhaTi.modules.financial.repository.InvoiceRepository;
import com.unimedvargina.UnimedVarginhaTi.shared.exception.BusinessRuleException;
import com.unimedvargina.UnimedVarginhaTi.shared.exception.ResourceNotFoundException;
import com.unimedvargina.UnimedVarginhaTi.shared.service.SectorService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Service
public class InvoiceService {

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private ApportionmentRepository apportionmentRepository;

    @Autowired
    private ContractService contractService;

    @Autowired
    private SectorService sectorService;

    @Transactional
    public Invoice createInvoiceWithApportionment(InvoiceRequestDTO dto) {
        Contract contract = contractService.findById(dto.contractId());

        LocalDate competence = YearMonth.from(dto.competence()).atDay(1);

        validateDates(dto);
        validateCostDestination(dto);
        validateNoDuplicatedSector(dto);
        validateNotDuplicated(contract.getId(), competence);

        Invoice invoice = new Invoice();
        invoice.setContract(contract);
        invoice.setNumber(dto.number().trim());
        invoice.setCompetence(competence);
        invoice.setAmount(dto.totalAmount());
        invoice.setIssueDate(dto.issueDate());
        invoice.setDueDate(dto.dueDate());
        invoice.setStatus(InvoiceStatus.ISSUED);
        invoice.setCostAllocation(dto.costAllocation());

        Invoice savedInvoice = invoiceRepository.save(invoice);

        // Custo integral do CNPJ: nao ha itens de rateio a gravar. O dono do custo
        // e a empresa do contrato.
        if (dto.costAllocation() == CostAllocationType.ENTERPRISE) {
            return savedInvoice;
        }

        List<Apportionment> apportionments = dto.items().stream()
                .map(item -> {
                    Apportionment apportionment = new Apportionment();
                    apportionment.setInvoice(savedInvoice);
                    apportionment.setSector(sectorService.findById(item.sectorId())
                            .orElseThrow(() -> new ResourceNotFoundException("Setor", item.sectorId())));
                    apportionment.setAllocation(item.allocation());
                    return apportionment;
                })
                .toList();

        apportionmentRepository.saveAll(apportionments);

        return savedInvoice;
    }

    /**
     * Toda nota tem destino de custo, e o destino define o que é exigido.
     *
     * <p>Com rateio, a soma dos itens tem de fechar exatamente com o valor da nota
     * — regra que a planilha não conseguia impor. Sem rateio, o custo é integral da
     * empresa do contrato, e itens de rateio ali seriam contradição: o mesmo valor
     * apareceria como custo do CNPJ e como custo dos centros.
     */
    private void validateCostDestination(InvoiceRequestDTO dto) {
        boolean hasItems = dto.items() != null && !dto.items().isEmpty();

        if (dto.costAllocation() == CostAllocationType.ENTERPRISE) {
            if (hasItems) {
                throw new BusinessRuleException(
                        "A nota foi marcada como custo integral do CNPJ, então não pode ter rateio por centro de custo.");
            }
            return;
        }

        if (!hasItems) {
            throw new BusinessRuleException(
                    "Informe o rateio por centro de custo, ou marque a nota como custo integral do CNPJ.");
        }

        validateApportionmentTotal(dto);
    }

    /** Um contrato gera uma nota por mês: a segunda no mesmo mês é lançamento repetido. */
    private void validateNotDuplicated(UUID contractId, LocalDate competence) {
        invoiceRepository.findByContractIdAndCompetence(contractId, competence)
                .ifPresent(existing -> {
                    throw new BusinessRuleException(
                            "Já existe a nota %s lançada para este contrato na competência %s."
                                    .formatted(existing.getNumber(), YearMonth.from(competence)));
                });
    }

    private void validateApportionmentTotal(InvoiceRequestDTO dto) {
        BigDecimal allocated = dto.items().stream()
                .map(InvoiceRequestDTO.ApportionmentItemDTO::allocation)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (allocated.compareTo(dto.totalAmount()) != 0) {
            BigDecimal difference = allocated.subtract(dto.totalAmount());
            throw new BusinessRuleException(
                    "A soma do rateio (%s) não confere com o valor da fatura (%s). Diferença de %s."
                            .formatted(allocated.toPlainString(),
                                    dto.totalAmount().toPlainString(),
                                    difference.toPlainString()));
        }
    }

    private void validateNoDuplicatedSector(InvoiceRequestDTO dto) {
        if (dto.items() == null) {
            return;
        }
        Set<UUID> sectors = new HashSet<>();
        dto.items().stream()
                .map(InvoiceRequestDTO.ApportionmentItemDTO::sectorId)
                .filter(sectorId -> !sectors.add(sectorId))
                .findFirst()
                .ifPresent(duplicated -> {
                    throw new BusinessRuleException(
                            "O setor " + duplicated + " aparece mais de uma vez no rateio.");
                });
    }

    private void validateDates(InvoiceRequestDTO dto) {
        if (dto.dueDate().isBefore(dto.issueDate())) {
            throw new BusinessRuleException(
                    "A data de vencimento não pode ser anterior à data de emissão.");
        }
    }

    public InvoiceResponseDTO findByIdWithApportionments(UUID id) {

        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fatura", id));

        BigDecimal totalAmount = invoice.getAmount();

        List<InvoiceResponseDTO.ApportionmentItemResponseDTO> items =
                apportionmentRepository.findByInvoiceId(id)
                        .stream()
                        .map(apportionment -> {
                            BigDecimal allocation = apportionment.getAllocation();

                            BigDecimal percentage = BigDecimal.ZERO;
                            if (totalAmount != null && totalAmount.compareTo(BigDecimal.ZERO) > 0) {
                                percentage = allocation
                                        .multiply(BigDecimal.valueOf(100))
                                        .divide(totalAmount, 3, RoundingMode.HALF_UP);
                            }

                            return new InvoiceResponseDTO.ApportionmentItemResponseDTO(
                                    apportionment.getSector().getId(),
                                    apportionment.getSector().getName(),
                                    apportionment.getSector().getCostCenterCode(),
                                    allocation,
                                    percentage
                            );
                        })
                        .toList();

        return new InvoiceResponseDTO(
                invoice.getId(),
                invoice.getContract().getId(),
                invoice.getNumber(),
                invoice.getAmount(),
                invoice.getIssueDate(),
                invoice.getDueDate(),
                invoice.getStatus(),
                invoice.getContract().getServiceDescription(),
                invoice.getContract().getServiceType(),
                items
        );
    }

    public Optional<InvoiceApportionmentTemplateDTO> findPreviousMonthApportionmentTemplate(
            UUID contractId,
            LocalDate referenceDate
    ) {
        LocalDate previousCompetence = YearMonth.from(referenceDate).minusMonths(1).atDay(1);

        return invoiceRepository.findByContractIdAndCompetence(contractId, previousCompetence)
                .map(invoice -> {
                    BigDecimal totalAmount = invoice.getAmount();

                    List<InvoiceApportionmentTemplateDTO.ApportionmentTemplateItemDTO> items =
                            apportionmentRepository.findByInvoiceId(invoice.getId())
                                    .stream()
                                    .map(apportionment -> {
                                        BigDecimal allocation = apportionment.getAllocation();
                                        BigDecimal percentage = BigDecimal.ZERO;

                                        if (totalAmount != null && totalAmount.compareTo(BigDecimal.ZERO) > 0) {
                                            percentage = allocation
                                                    .multiply(BigDecimal.valueOf(100))
                                                    .divide(totalAmount, 6, RoundingMode.HALF_UP);
                                        }

                                        return new InvoiceApportionmentTemplateDTO.ApportionmentTemplateItemDTO(
                                                apportionment.getSector().getId(),
                                                apportionment.getSector().getName(),
                                                allocation,
                                                percentage
                                        );
                                    })
                                    .toList();

                    return new InvoiceApportionmentTemplateDTO(
                            invoice.getId(),
                            invoice.getNumber(),
                            invoice.getIssueDate(),
                            totalAmount,
                            items
                    );
                });
    }
}
