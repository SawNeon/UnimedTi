package com.unimedvargina.UnimedVarginhaTi.modules.orders.repository;

import com.unimedvargina.UnimedVarginhaTi.modules.orders.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;
@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {
}
