package com.unimedvargina.UnimedVarginhaTi.modules.inventory.service;

import com.unimedvargina.UnimedVarginhaTi.modules.inventory.model.InventoryMovements;
import com.unimedvargina.UnimedVarginhaTi.modules.inventory.model.Product;
import com.unimedvargina.UnimedVarginhaTi.modules.inventory.repository.InventoryMovementRepository;
import com.unimedvargina.UnimedVarginhaTi.modules.inventory.repository.ProductRepository;
import com.unimedvargina.UnimedVarginhaTi.shared.exception.BusinessRuleException;
import com.unimedvargina.UnimedVarginhaTi.shared.exception.ResourceNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class ProductService {

    /**
     * Tipos de movimentação de estoque. Padronizados em maiúsculo — antes a entrada
     * gravava "in" e a saída "OUT", o que quebrava qualquer filtro por tipo.
     */
    public static final String MOVEMENT_IN = "IN";
    public static final String MOVEMENT_OUT = "OUT";

    @Autowired
    private ProductRepository repository;

    @Autowired
    private InventoryMovementRepository movementRepository;

    public Product save(Product product) {
        return repository.save(product);
    }

    public List<Product> listAll() {
        return repository.findAll();
    }

    public Product update(Product product) {
        return repository.save(product);
    }

    public void delete(UUID id) {
        repository.deleteById(id);
    }

    public Product findById(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produto", id));
    }

    @Transactional
    public Product addStock(UUID productId, InventoryMovements movementRequest) {
        Product product = findById(productId);
        int quantity = requirePositiveQuantity(movementRequest);

        product.setCurrentStock(product.getCurrentStock() + quantity);

        movementRequest.setProduct(product);
        movementRequest.setType(MOVEMENT_IN);
        movementRepository.save(movementRequest);

        return repository.save(product);
    }

    @Transactional
    public Product removeStock(UUID productId, InventoryMovements movementRequest) {
        Product product = findById(productId);
        int quantity = requirePositiveQuantity(movementRequest);

        if (product.getCurrentStock() < quantity) {
            throw new BusinessRuleException(
                    "Saída de %d unidade(s) maior que o estoque atual de %s (%d)."
                            .formatted(quantity, product.getName(), product.getCurrentStock()));
        }

        product.setCurrentStock(product.getCurrentStock() - quantity);

        movementRequest.setProduct(product);
        movementRequest.setType(MOVEMENT_OUT);
        movementRepository.save(movementRequest);

        return repository.save(product);
    }

    public Page<Product> getAllProductsPaginated(int page, int size) {
        return repository.findAll(PageRequest.of(page, size));
    }

    /**
     * Impede movimentação com quantidade nula, zero ou negativa — uma entrada
     * negativa era aceita e diminuía o estoque silenciosamente.
     */
    private int requirePositiveQuantity(InventoryMovements movement) {
        Integer quantity = movement.getQuantity();
        if (quantity == null || quantity <= 0) {
            throw new BusinessRuleException("A quantidade da movimentação deve ser maior que zero.");
        }
        return quantity;
    }
}
