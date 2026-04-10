package com.unimedvargina.UnimedVarginhaTi.modules.orders.model;

import com.unimedvargina.UnimedVarginhaTi.shared.BaseEntity;
import com.unimedvargina.UnimedVarginhaTi.shared.model.Sector;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "purchase_orders")
@Getter @Setter @NoArgsConstructor
public class Order extends BaseEntity {

    @Column(updatable = false)
    private LocalDateTime orderDate;

    @ManyToOne
    @JoinColumn(name = "sector_id")
    private Sector sector;

    @Column(updatable = false)
    private String type;

    @Column(columnDefinition = "TEXT", updatable = false)
    private String description;

    @Enumerated(EnumType.STRING)
    private OrderStatus status;

    @Column(updatable = false)
    private Integer numberRequest;

    @Column(length = 500, updatable = false)
    private String request;

    private LocalDate expectedDeliveryDate;

    @Column(length = 500)
    private String invoice;

    private LocalDateTime receivedDate;
}
