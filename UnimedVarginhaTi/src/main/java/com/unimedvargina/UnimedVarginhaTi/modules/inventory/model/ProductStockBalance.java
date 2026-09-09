package com.unimedvargina.UnimedVarginhaTi.modules.inventory.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.unimedvargina.UnimedVarginhaTi.shared.BaseEntity;
import com.unimedvargina.UnimedVarginhaTi.shared.model.OperationalUnit;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Saldo de um produto em uma unidade operacional.
 *
 * <p>O catálogo de produtos é único: "Mouse USB" é um cadastro só, com saldo e
 * ponto de pedido próprios em cada estoque. É o que permite transferir entre as
 * equipes (saída de um lado, entrada no outro, mesmo produto) e consolidar o
 * consumo no dashboard sem depender de as duas equipes digitarem o mesmo nome.
 *
 * <p>O saldo vive só aqui. Guardar um total também em {@link Product} criaria duas
 * verdades para o mesmo número.
 */
@Entity
@Table(
        name = "product_stock_balances",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_product_stock_balances_product_unit",
                columnNames = {"product_id", "unit_id"}
        )
)
@Getter
@Setter
@NoArgsConstructor
public class ProductStockBalance extends BaseEntity {

    @ManyToOne(optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    @JsonIgnore
    private Product product;

    @ManyToOne(optional = false)
    @JoinColumn(name = "unit_id", nullable = false)
    private OperationalUnit unit;

    @Column(nullable = false)
    private Integer currentStock = 0;

    @Column(nullable = false)
    private Integer minStockLevel = 0;

    public ProductStockBalance(Product product, OperationalUnit unit, Integer minStockLevel) {
        this.product = product;
        this.unit = unit;
        this.currentStock = 0;
        this.minStockLevel = minStockLevel == null ? 0 : minStockLevel;
    }

    /** Verdadeiro quando o saldo atingiu ou passou do ponto de pedido. */
    public boolean isBelowMinimum() {
        return currentStock <= minStockLevel;
    }
}
