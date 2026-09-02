package com.unimedvargina.UnimedVarginhaTi.modules.orders.service;

import com.unimedvargina.UnimedVarginhaTi.modules.orders.model.Order;
import com.unimedvargina.UnimedVarginhaTi.modules.orders.model.OrderStatus;
import com.unimedvargina.UnimedVarginhaTi.modules.orders.repository.OrderRepository;
import com.unimedvargina.UnimedVarginhaTi.shared.exception.ResourceNotFoundException;
import com.unimedvargina.UnimedVarginhaTi.shared.service.FileStorageService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class OrderService {

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private OrderRepository orderRepository;

    @Transactional
    public Order createOrder(Order orderData, MultipartFile requestFile) {

        if (requestFile != null && !requestFile.isEmpty()) {
            String requestPath = fileStorageService.storeFile(requestFile, "orders/requests");
            orderData.setRequest(requestPath);
        }

        orderData.setOrderDate(LocalDateTime.now());
        orderData.setStatus(OrderStatus.ORDERED);

        return orderRepository.save(orderData);
    }

    @Transactional
    public Order deliverOrder(UUID orderId, MultipartFile invoiceFile) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Pedido", orderId));

        String invoicePath = fileStorageService.storeFile(invoiceFile, "orders/invoices");
        order.setInvoice(invoicePath);

        order.setStatus(OrderStatus.DELIVERED);
        order.setReceivedDate(LocalDateTime.now());

        return orderRepository.save(order);
    }

    public List<Order> findAll() {
        return orderRepository.findAll();
    }


    public Page<Order> getAllOrdersPaginated(int page, int size) {
        return orderRepository.findAll(PageRequest.of(page, size));
    }
}
