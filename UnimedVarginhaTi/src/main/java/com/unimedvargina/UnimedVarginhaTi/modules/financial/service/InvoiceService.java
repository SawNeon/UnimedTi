package com.unimedvargina.UnimedVarginhaTi.modules.financial.service;

import com.unimedvargina.UnimedVarginhaTi.modules.financial.dto.InvoiceRequestDTO;
import com.unimedvargina.UnimedVarginhaTi.modules.financial.dto.InvoiceResponseDTO;
import com.unimedvargina.UnimedVarginhaTi.modules.financial.model.Apportionment;
import com.unimedvargina.UnimedVarginhaTi.modules.financial.model.Contract;
import com.unimedvargina.UnimedVarginhaTi.modules.financial.model.Invoice;
import com.unimedvargina.UnimedVarginhaTi.modules.financial.model.InvoiceStatus;
import com.unimedvargina.UnimedVarginhaTi.modules.financial.repository.ApportionmentRepository;
import com.unimedvargina.UnimedVarginhaTi.modules.financial.repository.InvoiceRepository;
import com.unimedvargina.UnimedVarginhaTi.shared.model.Sector;
import com.unimedvargina.UnimedVarginhaTi.shared.service.SectorService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
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

        Invoice invoice = new Invoice();
        invoice.setContract(contract);
        invoice.setNumber(dto.number());
        invoice.setAmount(dto.totalAmount());
        invoice.setIssueDate(dto.issueDate());
        invoice.setDueDate(dto.dueDate());
        invoice.setStatus(InvoiceStatus.ISSUED);

        Invoice savedInvoice = invoiceRepository.save(invoice);

        for (InvoiceRequestDTO.ApportionmentItemDTO item : dto.items()) {
            Apportionment apportionment = new Apportionment();
            apportionment.setInvoice(savedInvoice);

            Sector sector = sectorService.findById(item.sectorId())
                    .orElseThrow(() -> new RuntimeException("Sector not found: " + item.sectorId()));
            apportionment.setSector(sector);
            apportionment.setAllocation(item.allocation());

            apportionmentRepository.save(apportionment);
        }

        return savedInvoice;
    }

    public InvoiceResponseDTO findByIdWithApportionments(UUID id) {

        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Invoice not found: " + id));

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
}
