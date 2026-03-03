package com.unimedvargina.UnimedVarginhaTi.modules.inventory.service;

import com.unimedvargina.UnimedVarginhaTi.modules.inventory.model.Product;
import com.unimedvargina.UnimedVarginhaTi.modules.inventory.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
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

}
