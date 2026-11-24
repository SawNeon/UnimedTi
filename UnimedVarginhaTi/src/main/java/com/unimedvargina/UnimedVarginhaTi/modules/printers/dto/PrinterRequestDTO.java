package com.unimedvargina.UnimedVarginhaTi.modules.printers.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * Cadastro de impressora.
 *
 * <p>{@code shares} pode vir vazio -- e o caso da reserva, cujo rateio so e
 * definido quando ha uso. Vindo preenchido, a soma dos percentuais tem de ser 100.
 */
public record PrinterRequestDTO(
        @NotBlank(message = "O número de série é obrigatório.")
        @Size(max = 80, message = "O número de série deve ter no máximo 80 caracteres.")
        String serialNumber,

        @Size(max = 40, message = "O patrimônio deve ter no máximo 40 caracteres.")
        String assetTag,

        @Size(max = 120, message = "O modelo deve ter no máximo 120 caracteres.")
        String model,

        @Size(max = 45, message = "O IP deve ter no máximo 45 caracteres.")
        String ipAddress,

        @NotNull(message = "A empresa é obrigatória.")
        UUID enterpriseId,

        /** Falso para a impressora que o PrintWay não lê e alguém digita todo mês. */
        boolean autoRead,

        boolean backup,

        boolean active,

        @Valid
        List<ShareDTO> shares
) {
    public record ShareDTO(
            @NotNull(message = "O setor do rateio é obrigatório.")
            UUID sectorId,

            @NotNull(message = "O percentual é obrigatório.")
            @DecimalMin(value = "0.0001", message = "O percentual deve ser maior que zero.")
            @DecimalMax(value = "100.0000", message = "O percentual não pode passar de 100.")
            BigDecimal percentage
    ) {}
}
