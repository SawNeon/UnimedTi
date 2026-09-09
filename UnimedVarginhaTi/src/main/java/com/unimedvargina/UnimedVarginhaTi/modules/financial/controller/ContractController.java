package com.unimedvargina.UnimedVarginhaTi.modules.financial.controller;

import com.unimedvargina.UnimedVarginhaTi.modules.financial.model.Contract;
import com.unimedvargina.UnimedVarginhaTi.modules.financial.dto.ContractResponseDTO;
import com.unimedvargina.UnimedVarginhaTi.modules.financial.service.ContractService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/contracts")
public class ContractController {

    @Autowired
    private ContractService contractService;

    @PreAuthorize("@access.canOperate('FINANCIAL')")
    @PostMapping
    public ResponseEntity<Contract> create(@RequestBody Contract contract) {
        return ResponseEntity.ok(contractService.save(contract));
    }

    @PreAuthorize("@access.canRead('FINANCIAL')")
    @GetMapping
    public ResponseEntity<Page<ContractResponseDTO>> getContracts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam String month
    ) {
        Page<ContractResponseDTO> contractsPage = contractService.getContractsWithInvoiceByMonth(page, size, month);
        return ResponseEntity.ok(contractsPage);
    }
}