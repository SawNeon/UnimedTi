package com.unimedvargina.UnimedVarginhaTi.shared.controller;

import com.unimedvargina.UnimedVarginhaTi.modules.financial.model.Contract;
import com.unimedvargina.UnimedVarginhaTi.modules.financial.service.ContractService;
import com.unimedvargina.UnimedVarginhaTi.shared.dto.SectorRequestDTO;
import com.unimedvargina.UnimedVarginhaTi.shared.dto.SectorResponseDTO;
import com.unimedvargina.UnimedVarginhaTi.shared.service.SectorService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Cadastro dos setores, que sao os centros de custo do rateio.
 *
 * <p>Leitura para qualquer autenticado, porque estoque, ativos, pedidos e fiscal
 * precisam da lista. Escrita e configuracao, entao exige USER_MANAGEMENT.
 */
@RestController
@RequestMapping("/api/sectors")
public class SectorController {

    @Autowired
    private SectorService sectorService;

    @Autowired
    private ContractService contractService;

    @PreAuthorize("isAuthenticated()")
    @GetMapping
    public ResponseEntity<List<SectorResponseDTO>> findAll() {
        return ResponseEntity.ok(sectorService.listAll());
    }

    /** Setores da empresa do contrato — alimenta o rateio da nota. */
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/contract/{contractId}")
    public ResponseEntity<List<SectorResponseDTO>> findByContract(@PathVariable UUID contractId) {
        Contract contract = contractService.findById(contractId);
        if (contract.getEnterprise() == null) {
            return ResponseEntity.badRequest().build();
        }

        List<SectorResponseDTO> sectors = sectorService.findByEnterpriseId(contract.getEnterprise().getId())
                .stream()
                .map(SectorResponseDTO::from)
                .toList();

        return ResponseEntity.ok(sectors);
    }

    @PreAuthorize("@access.canOperate('USER_MANAGEMENT')")
    @PostMapping
    public ResponseEntity<SectorResponseDTO> create(@Valid @RequestBody SectorRequestDTO request) {
        return ResponseEntity.ok(sectorService.create(request));
    }

    @PreAuthorize("@access.canOperate('USER_MANAGEMENT')")
    @PutMapping("/{id}")
    public ResponseEntity<SectorResponseDTO> update(@PathVariable UUID id,
                                                    @Valid @RequestBody SectorRequestDTO request) {
        return ResponseEntity.ok(sectorService.update(id, request));
    }

    /** Recusado quando houver movimentação, pedido ou rateio vinculado. */
    @PreAuthorize("@access.canOperate('USER_MANAGEMENT')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        sectorService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
