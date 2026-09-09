package com.unimedvargina.UnimedVarginhaTi.shared.controller;

import com.unimedvargina.UnimedVarginhaTi.shared.dto.SupplierRequestDTO;
import com.unimedvargina.UnimedVarginhaTi.shared.dto.SupplierResponseDTO;
import com.unimedvargina.UnimedVarginhaTi.shared.service.SupplierService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Cadastro das empresas fornecedoras.
 *
 * <p>Leitura para qualquer autenticado, porque a tela de contrato precisa da
 * lista. Escrita e configuracao, entao exige USER_MANAGEMENT -- o mesmo criterio
 * das empresas e dos setores.
 */
@RestController
@RequestMapping("/api/suppliers")
public class SupplierController {

    @Autowired
    private SupplierService service;

    @PreAuthorize("isAuthenticated()")
    @GetMapping
    public ResponseEntity<List<SupplierResponseDTO>> findAll() {
        return ResponseEntity.ok(service.listAll());
    }

    @PreAuthorize("@access.canOperate('USER_MANAGEMENT')")
    @PostMapping
    public ResponseEntity<SupplierResponseDTO> create(@Valid @RequestBody SupplierRequestDTO request) {
        return ResponseEntity.ok(service.create(request));
    }

    @PreAuthorize("@access.canOperate('USER_MANAGEMENT')")
    @PutMapping("/{id}")
    public ResponseEntity<SupplierResponseDTO> update(@PathVariable UUID id,
                                                      @Valid @RequestBody SupplierRequestDTO request) {
        return ResponseEntity.ok(service.update(id, request));
    }

    /** Recusado quando houver contrato vinculado, para nao perder de quem era a nota. */
    @PreAuthorize("@access.canOperate('USER_MANAGEMENT')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
