package com.unimedvargina.UnimedVarginhaTi.modules.orders.model;

import com.unimedvargina.UnimedVarginhaTi.shared.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "orders")
@Getter @Setter @NoArgsConstructor
public class Order extends BaseEntity {

    @Column(updatable = false)
    private LocalDateTime orderDate;

    @Column(updatable = false)
    private String Sector;

    @Column(updatable = false)
    private String type;

    @Column(updatable = false)
    private String description;

    @Column(updatable = false)
    private OrderStatus status;

    private LocalDateTime expectedDeliveryDate;

    private String invoice;

    private LocalDateTime receivedDate;
}
