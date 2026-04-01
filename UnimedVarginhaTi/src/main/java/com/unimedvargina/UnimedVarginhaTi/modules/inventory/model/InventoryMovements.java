package com.unimedvargina.UnimedVarginhaTi.modules.inventory.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.unimedvargina.UnimedVarginhaTi.shared.BaseEntity;
import com.unimedvargina.UnimedVarginhaTi.shared.model.Sector;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "inventory_movements")
@Getter @Setter
public class InventoryMovements extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    @JsonIgnore
    private Product product;

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false)
    private String reason;

    @Column(nullable = false)
    private String responsible;

    @ManyToOne
    @JoinColumn(name = "sector_id")
    private Sector sector;

    @Column(nullable = false)
    private String type;

}
