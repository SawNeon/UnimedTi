package com.unimedvargina.UnimedVarginhaTi.modules.users.dto;

import java.util.List;
import java.util.UUID;

/**
 * Quem sou eu e o que alcanco.
 *
 * <p>O frontend monta o menu e o seletor de unidade a partir daqui, em vez de
 * adivinhar. Continua sendo so aparencia: quem recusa a chamada e o
 * {@code @PreAuthorize} no backend.
 */
public record MeResponseDTO(
        UUID id,
        String login,
        String name,
        String email,
        String profileName,
        List<ModuleAccessDTO> modules
) {
    /** Nivel em um modulo: o maior entre as unidades, e o detalhe por unidade. */
    public record ModuleAccessDTO(String module, String level, List<UnitAccessDTO> units) {
    }

    public record UnitAccessDTO(UUID unitId, String unitName, String level) {
    }
}
