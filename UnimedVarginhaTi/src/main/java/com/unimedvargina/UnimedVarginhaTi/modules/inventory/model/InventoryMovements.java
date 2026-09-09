package com.unimedvargina.UnimedVarginhaTi.modules.inventory.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.unimedvargina.UnimedVarginhaTi.shared.BaseEntity;
import com.unimedvargina.UnimedVarginhaTi.shared.model.OperationalUnit;
import com.unimedvargina.UnimedVarginhaTi.shared.model.Sector;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "inventory_movements")
@Getter
@Setter
public class InventoryMovements extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    @JsonIgnore
    private Product product;

    /** De qual estoque a movimentação saiu ou entrou. */
    @ManyToOne(optional = false)
    @JoinColumn(name = "unit_id", nullable = false)
    private OperationalUnit unit;

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false)
    private String reason;

    @Column(nullable = false)
    private String responsible;

    /** Local de destino do consumo (APS, hospital, serviços próprios, matriz...). */
    @ManyToOne
    @JoinColumn(name = "sector_id")
    private Sector sector;

    @Column(nullable = false)
    private String type;

    /**
     * As duas pernas de uma transferência entre estoques compartilham este valor.
     * Permite reconstruir o par saída/entrada sem uma tabela à parte. Nulo em
     * movimentações comuns.
     */
    @Column(name = "transfer_group_id")
    private UUID transferGroupId;

}
