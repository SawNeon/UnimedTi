package com.unimedvargina.UnimedVarginhaTi.modules.inventory.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.unimedvargina.UnimedVarginhaTi.shared.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

/**
 * Cadastro do produto — o catálogo é compartilhado pelas duas equipes.
 *
 * <p>O saldo e o ponto de pedido NÃO ficam aqui: vivem em
 * {@link ProductStockBalance}, uma linha por unidade operacional. Um total único
 * no produto voltaria a misturar os estoques da matriz e do hospital.
 */
@Entity
@Table(name = "products")
@Getter @Setter @NoArgsConstructor
public class Product extends BaseEntity {

    @Column(nullable = false)
    private String name;

    private String description;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<ProductStockBalance> balances = new ArrayList<>();

    @OneToMany(mappedBy = "product", cascade = CascadeType.REMOVE)
    @JsonIgnore
    private List<InventoryMovements> movements = new ArrayList<>();

}
