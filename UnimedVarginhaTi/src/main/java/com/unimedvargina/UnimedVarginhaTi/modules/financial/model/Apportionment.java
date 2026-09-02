package com.unimedvargina.UnimedVarginhaTi.modules.financial.model;

import com.unimedvargina.UnimedVarginhaTi.shared.BaseEntity;
import com.unimedvargina.UnimedVarginhaTi.shared.model.Sector;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "Apportionments")
@Getter
@Setter
@NoArgsConstructor
public class Apportionment extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "invoice_id", nullable = false)
    private Invoice invoice;

    @ManyToOne
    @JoinColumn(name = "sector_id", nullable = false)
    private Sector sector;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal allocation;

}
