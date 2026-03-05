package com.unimedvargina.UnimedVarginhaTi.modules.inventory.service;

import com.unimedvargina.UnimedVarginhaTi.modules.inventory.model.InventoryMovements;
import com.unimedvargina.UnimedVarginhaTi.modules.inventory.model.Product;
import com.unimedvargina.UnimedVarginhaTi.modules.inventory.repository.InventoryMovementRepository;
import com.unimedvargina.UnimedVarginhaTi.modules.inventory.repository.ProductRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ProductService {
    @Autowired
    private ProductRepository repository;

    public Product save(Product product){
        return repository.save(product);
    }

    public List<Product> listAll() {
        return repository.findAll();
    }

    public Product update(Product product) { return repository.save(product); }

    public void delete(UUID id) { repository.deleteById(id);}

    public Product findById(UUID id) { return repository.findById(id).orElseThrow(() -> new RuntimeException("Product not found!"));}

    @Autowired
    private InventoryMovementRepository movementRepository;

    @Transactional
    public Product addStock(UUID productId, InventoryMovements movementRequest) {
        Product product = findById(productId);

        int newStock = product.getCurrentStock() + movementRequest.getQuantity();
        product.setCurrentStock(newStock);

        movementRequest.setProduct(product);
        movementRequest.setType("in");
        movementRepository.save(movementRequest);

        return repository.save(product);
    }

    @Transactional
    public Product removeStock(UUID productId, InventoryMovements movementRequest) {
        Product product = findById(productId);

        if (product.getCurrentStock() < movementRequest.getQuantity()) {
            throw new IllegalArgumentException("Estoque insuficiente para a retirada.");
        }

        int newStock = product.getCurrentStock() - movementRequest.getQuantity();
        product.setCurrentStock(newStock);

        movementRequest.setProduct(product);
        movementRequest.setType("OUT");
        movementRepository.save(movementRequest);

        return repository.save(product);
    }

}
