package com.unimedvargina.UnimedVarginhaTi.modules.financial.service;

import com.unimedvargina.UnimedVarginhaTi.modules.financial.dto.ContractResponseDTO;
import com.unimedvargina.UnimedVarginhaTi.modules.financial.model.Contract;
import com.unimedvargina.UnimedVarginhaTi.modules.financial.model.Invoice;
import com.unimedvargina.UnimedVarginhaTi.modules.financial.repository.ContractRepository;
import com.unimedvargina.UnimedVarginhaTi.modules.financial.repository.InvoiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

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

    public Page<ContractResponseDTO> getContractsWithInvoiceByMonth(int page, int size, String monthStr) {
        String[] parts = monthStr.split("-");
        int year = Integer.parseInt(parts[0]);
        int month = Integer.parseInt(parts[1]);

        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());

        Page<Contract> contractsPage = contractRepository.findAll(PageRequest.of(page, size));

        return contractsPage.map(contract -> {
            Optional<Invoice> invoiceOpt = invoiceRepository.findByContractIdAndMonthRange(contract.getId(), startDate, endDate);

            ContractResponseDTO.InvoiceMonthDTO invoiceDTO = invoiceOpt.map(invoice ->
                    new ContractResponseDTO.InvoiceMonthDTO(
                            invoice.getId(),
                            invoice.getNumber(),
                            invoice.getAmount(),
                            invoice.getStatus()
                    )
            ).orElse(null);

            return new ContractResponseDTO(
                    contract.getId(),
                    contract.getEnterprise() != null ? contract.getEnterprise().getName() : "Empresa não informada",
                    contract.getServiceType(),
                    contract.getServiceDescription(),
                    contract.getStatus(),
                    invoiceDTO
            );
        });
    }

    public Contract save(Contract contract) { return contractRepository.save(contract); }

    public Contract findById(UUID id) { return contractRepository.findById(id).orElseThrow(() -> new RuntimeException("Contract not found!"));}

    public List<Contract> findAll() { return contractRepository.findAll(); }

    public Contract update(Contract contract) { return contractRepository.save(contract); }

    public Page<Contract> getAllContractsPaginated(int page, int size) {
        return contractRepository.findAll(PageRequest.of(page, size));
    }
}
