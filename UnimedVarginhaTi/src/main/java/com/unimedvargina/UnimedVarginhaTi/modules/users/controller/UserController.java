package com.unimedvargina.UnimedVarginhaTi.modules.users.controller;

import com.unimedvargina.UnimedVarginhaTi.modules.users.dto.*;
import com.unimedvargina.UnimedVarginhaTi.modules.users.service.UserManagementService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Gestao de usuarios e perfis de acesso.
 *
 * <p>Tudo aqui exige USER_MANAGEMENT, menos {@code /api/users/me}: qualquer pessoa
 * autenticada precisa saber o proprio alcance para o frontend montar o menu.
 *
 * <p>Nenhuma resposta traz senha, nem o hash — as respostas usam
 * {@link UserResponseDTO}, nunca a entidade.
 */
@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserManagementService service;

    /** Quem sou eu e o que alcanco. Nao exige permissao alem de estar autenticado. */
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/me")
    public ResponseEntity<MeResponseDTO> me() {
        return ResponseEntity.ok(service.currentUserAccess());
    }

    @PreAuthorize("@access.canRead('USER_MANAGEMENT')")
    @GetMapping
    public ResponseEntity<List<UserResponseDTO>> findAll() {
        return ResponseEntity.ok(service.listAll());
    }

    @PreAuthorize("@access.canRead('USER_MANAGEMENT')")
    @GetMapping("/profiles")
    public ResponseEntity<List<AccessProfileResponseDTO>> findProfiles() {
        return ResponseEntity.ok(service.listProfiles());
    }

    @PreAuthorize("@access.canOperate('USER_MANAGEMENT')")
    @PostMapping
    public ResponseEntity<UserResponseDTO> create(@Valid @RequestBody UserRequestDTO request) {
        return ResponseEntity.ok(service.create(request));
    }

    @PreAuthorize("@access.canOperate('USER_MANAGEMENT')")
    @PutMapping("/{id}")
    public ResponseEntity<UserResponseDTO> update(@PathVariable UUID id,
                                                  @Valid @RequestBody UserUpdateDTO request) {
        return ResponseEntity.ok(service.update(id, request));
    }

    /** Ativa ou desativa. Nao existe exclusao: ela apagaria a rastreabilidade. */
    @PreAuthorize("@access.canOperate('USER_MANAGEMENT')")
    @PatchMapping("/{id}/active")
    public ResponseEntity<UserResponseDTO> setActive(@PathVariable UUID id,
                                                     @RequestParam boolean active) {
        return ResponseEntity.ok(service.setActive(id, active));
    }

    @PreAuthorize("@access.canOperate('USER_MANAGEMENT')")
    @PutMapping("/{id}/password")
    public ResponseEntity<Void> changePassword(@PathVariable UUID id,
                                               @Valid @RequestBody PasswordChangeDTO request) {
        service.changePassword(id, request);
        return ResponseEntity.noContent().build();
    }
}
