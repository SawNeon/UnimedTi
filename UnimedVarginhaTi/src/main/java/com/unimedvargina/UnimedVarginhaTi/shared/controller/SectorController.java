package com.unimedvargina.UnimedVarginhaTi.shared.controller;

import com.unimedvargina.UnimedVarginhaTi.modules.financial.model.Contract;
import com.unimedvargina.UnimedVarginhaTi.modules.financial.service.ContractService;
import com.unimedvargina.UnimedVarginhaTi.shared.model.Sector;
import com.unimedvargina.UnimedVarginhaTi.shared.repository.SectorRepository;
import com.unimedvargina.UnimedVarginhaTi.shared.service.SectorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/sectors")
public class SectorController {


    @Autowired
    private SectorService sectorService;

    @Autowired
    private ContractService contractService;

    @Autowired
    private SectorRepository sectorRepository;

    @PreAuthorize("isAuthenticated()")
    @GetMapping
    public Iterable<Sector> findAll() { return sectorService.findAll(); }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/contract/{contractId}")
    public ResponseEntity<List<Sector>> findByContract(@PathVariable UUID contractId) {
        Contract contract = contractService.findById(contractId);
        if (contract.getEnterprise() == null) {
            return ResponseEntity.badRequest().build();
        }
        List<Sector> sectors = sectorService.findByEnterpriseId(contract.getEnterprise().getId());
        return ResponseEntity.ok(sectors);
    }

    @PreAuthorize("@access.canOperate('USER_MANAGEMENT')")
    @PostMapping
    public Sector save(@RequestBody Sector sector) { return sectorService.save(sector); }
}
