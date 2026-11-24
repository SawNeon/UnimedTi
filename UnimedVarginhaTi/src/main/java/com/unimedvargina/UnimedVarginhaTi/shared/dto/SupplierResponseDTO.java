package com.unimedvargina.UnimedVarginhaTi.shared.dto;

import com.unimedvargina.UnimedVarginhaTi.shared.model.Supplier;

import java.util.UUID;

public record SupplierResponseDTO(
        UUID id,
        String name,
        String document,
        String notes,
        boolean active
) {
    public static SupplierResponseDTO from(Supplier supplier) {
        return new SupplierResponseDTO(
                supplier.getId(),
                supplier.getName(),
                supplier.getDocument(),
                supplier.getNotes(),
                supplier.isActive());
    }
}
