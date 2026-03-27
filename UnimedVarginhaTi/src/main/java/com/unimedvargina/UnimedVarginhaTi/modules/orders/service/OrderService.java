package com.unimedvargina.UnimedVarginhaTi.modules.orders.service;

import com.unimedvargina.UnimedVarginhaTi.modules.orders.model.Order;
import com.unimedvargina.UnimedVarginhaTi.modules.orders.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    public Order save(Order order) {
        return orderRepository.save(order);
    }

    public List<Order> findAll() {
        return orderRepository.findAll();
    }
}
