package com.unimedvargina.UnimedVarginhaTi.modules.inventory.model;

import com.unimedvargina.UnimedVarginhaTi.shared.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "products")
@Getter @Setter @NoArgsConstructor
public class Product extends BaseEntity {

    @Column(nullable = false)
    private String name;

    private String description;

    @Column(nullable = false)
    private Integer currentStock = 0;

    @Column(nullable = false)
    private Integer minStockLevel;

    @OneToMany(mappedBy = "product")
    private List<InventoryMovements> movements = new ArrayList<>();

}
