package com.unimedvargina.UnimedVarginhaTi.modules.orders.controller;


import com.unimedvargina.UnimedVarginhaTi.modules.orders.model.Order;
import com.unimedvargina.UnimedVarginhaTi.modules.orders.repository.OrderRepository;
import com.unimedvargina.UnimedVarginhaTi.modules.orders.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @PostMapping
    public Order save(@RequestBody Order order) { return orderService.save(order); }

    @GetMapping
    public List<Order> listAll()
    { return orderService.findAll();}
    
}
