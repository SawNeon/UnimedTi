package com.unimedvargina.UnimedVarginhaTi.shared.controller;

import com.unimedvargina.UnimedVarginhaTi.shared.dto.EnterpriseRequestDTO;
import com.unimedvargina.UnimedVarginhaTi.shared.dto.EnterpriseResponseDTO;
import com.unimedvargina.UnimedVarginhaTi.shared.service.EnterpriseService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Cadastro das empresas (CNPJ) do grupo.
 *
 * <p>Leitura para qualquer autenticado, porque varios modulos precisam da lista.
 * Escrita e configuracao, entao exige USER_MANAGEMENT.
 */
@RestController
@RequestMapping("/api/enterprises")
public class EnterpriseController {

    @Autowired
    private EnterpriseService serviceEnterprise;

    @PreAuthorize("isAuthenticated()")
    @GetMapping
    public ResponseEntity<List<EnterpriseResponseDTO>> findAll() {
        return ResponseEntity.ok(serviceEnterprise.listAll());
    }

    @PreAuthorize("@access.canOperate('USER_MANAGEMENT')")
    @PostMapping
    public ResponseEntity<EnterpriseResponseDTO> create(@Valid @RequestBody EnterpriseRequestDTO request) {
        return ResponseEntity.ok(serviceEnterprise.create(request));
    }

    @PreAuthorize("@access.canOperate('USER_MANAGEMENT')")
    @PutMapping("/{id}")
    public ResponseEntity<EnterpriseResponseDTO> update(@PathVariable UUID id,
                                                        @Valid @RequestBody EnterpriseRequestDTO request) {
        return ResponseEntity.ok(serviceEnterprise.update(id, request));
    }

    /** Recusado quando houver setor ou contrato vinculado, para nao perder historico. */
    @PreAuthorize("@access.canOperate('USER_MANAGEMENT')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        serviceEnterprise.delete(id);
        return ResponseEntity.noContent().build();
    }
}
