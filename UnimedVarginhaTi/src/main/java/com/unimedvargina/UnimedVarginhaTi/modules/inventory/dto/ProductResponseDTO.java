package com.unimedvargina.UnimedVarginhaTi.modules.inventory.dto;

import com.unimedvargina.UnimedVarginhaTi.modules.inventory.model.ProductStockBalance;

import java.util.UUID;

/**
 * Produto já resolvido para uma unidade: traz o saldo e o ponto de pedido
 * daquele estoque, não um total misturado.
 */
public record ProductResponseDTO(
        UUID id,
        String name,
        String description,
        Integer currentStock,
        Integer minStockLevel,
        UUID unitId,
        String unitName,
        boolean belowMinimum
) {
    public static ProductResponseDTO from(ProductStockBalance balance) {
        return new ProductResponseDTO(
                balance.getProduct().getId(),
                balance.getProduct().getName(),
                balance.getProduct().getDescription(),
                balance.getCurrentStock(),
                balance.getMinStockLevel(),
                balance.getUnit().getId(),
                balance.getUnit().getName(),
                balance.isBelowMinimum()
        );
    }
}
