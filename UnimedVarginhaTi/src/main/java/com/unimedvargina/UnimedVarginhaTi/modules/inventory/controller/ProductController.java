package com.unimedvargina.UnimedVarginhaTi.modules.inventory.controller;

import com.unimedvargina.UnimedVarginhaTi.modules.inventory.model.InventoryMovements;
import com.unimedvargina.UnimedVarginhaTi.modules.inventory.model.Product;
import com.unimedvargina.UnimedVarginhaTi.modules.inventory.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductService service;

    @PostMapping
    public Product create(@RequestBody Product product) {
        return service.save(product);
    }

    @GetMapping
    public List<Product> listAll(){
        return service.listAll();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Product> update(@PathVariable UUID id, @RequestBody Product product) {
        product.setId(id);
        Product updateProduct = service.update(product);
        return ResponseEntity.ok(updateProduct);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/add-stock")
    public Product addStock(@PathVariable UUID id, @RequestBody InventoryMovements movementRequest){
        return service.addStock(id, movementRequest);
    }

    @PostMapping("/{id}/remove-stock")
    public Product removeStock(@PathVariable UUID id, @RequestBody InventoryMovements movementRequest) {
        return service.removeStock(id, movementRequest);
    }

}
