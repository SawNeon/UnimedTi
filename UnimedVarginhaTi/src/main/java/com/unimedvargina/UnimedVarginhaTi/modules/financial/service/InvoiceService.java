package com.unimedvargina.UnimedVarginhaTi.modules.financial.service;

import com.unimedvargina.UnimedVarginhaTi.modules.financial.dto.InvoiceRequestDTO;
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

}
