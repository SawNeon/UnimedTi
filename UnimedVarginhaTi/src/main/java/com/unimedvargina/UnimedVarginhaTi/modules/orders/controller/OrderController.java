package com.unimedvargina.UnimedVarginhaTi.modules.orders.controller;


import com.unimedvargina.UnimedVarginhaTi.modules.orders.model.Order;
import com.unimedvargina.UnimedVarginhaTi.modules.orders.repository.OrderRepository;
import com.unimedvargina.UnimedVarginhaTi.modules.orders.service.OrderService;
import com.unimedvargina.UnimedVarginhaTi.shared.service.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.springframework.data.jpa.domain.AbstractPersistable_.id;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private OrderService orderService;


    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Order> createOrder(
            @RequestPart("data") Order orderData,
            @RequestPart(value = "requestFile", required = false) MultipartFile requestFile
    ) {
        Order savedOrder = orderService.createOrder(orderData, requestFile);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedOrder);
    }

    @PatchMapping(value = "/{id}/deliver", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Order> deliverOrder(
            @PathVariable UUID id,
            @RequestPart("invoiceFile") MultipartFile invoiceFile
    ){
        Order updateOrder = orderService.deliverOrder(id, invoiceFile);
        return ResponseEntity.ok(updateOrder);
    }



    

    @GetMapping
    public List<Order> listAll()
    { return orderService.findAll();}


}
