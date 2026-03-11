package com.unimedvargina.UnimedVarginhaTi.modules.assets.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.unimedvargina.UnimedVarginhaTi.modules.inventory.model.Product;
import com.unimedvargina.UnimedVarginhaTi.shared.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
@Entity
@Table(name = "asset_movements")
@Getter
@Setter
public class AssetMovements extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "asset_id", nullable = false)
    @JsonIgnore
    private Asset asset;

    @Column(nullable = false)
    private String reason;

    @Column(nullable = false)
    private String responsible;

    @Column(nullable = false)
    private String type;


}
