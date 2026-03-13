package com.unimedvargina.UnimedVarginhaTi.modules.assets.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.unimedvargina.UnimedVarginhaTi.modules.inventory.model.Product;
import com.unimedvargina.UnimedVarginhaTi.shared.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

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

    private LocalDate expectedReturnDate;

    private LocalDateTime actualReturnDate;

    @Column(nullable = false)
    private String type;

}
