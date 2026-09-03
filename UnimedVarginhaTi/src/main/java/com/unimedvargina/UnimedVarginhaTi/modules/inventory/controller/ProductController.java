package com.unimedvargina.UnimedVarginhaTi.modules.inventory.controller;

import com.unimedvargina.UnimedVarginhaTi.modules.inventory.dto.ProductRequestDTO;
import com.unimedvargina.UnimedVarginhaTi.modules.inventory.dto.ProductResponseDTO;
import com.unimedvargina.UnimedVarginhaTi.modules.inventory.dto.StockMovementRequestDTO;
import com.unimedvargina.UnimedVarginhaTi.modules.inventory.dto.StockTransferRequestDTO;
import com.unimedvargina.UnimedVarginhaTi.modules.inventory.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * Estoque de uma unidade operacional.
 *
 * <p>{@code unitId} e obrigatorio em toda operacao de saldo: sem ele nao existe
 * "o estoque", existem dois. Deixar o parametro opcional com um padrao faria a
 * equipe do hospital mexer no estoque da matriz por engano.
 */
@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductService service;

    @PostMapping
    public ResponseEntity<ProductResponseDTO> create(@RequestParam UUID unitId,
                                                     @Valid @RequestBody ProductRequestDTO request) {
        return ResponseEntity.ok(service.create(request, unitId));
    }

    @GetMapping
    public ResponseEntity<Page<ProductResponseDTO>> getProducts(
            @RequestParam UUID unitId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(service.listByUnit(unitId, page, size));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductResponseDTO> update(@PathVariable UUID id,
                                                     @RequestParam UUID unitId,
                                                     @Valid @RequestBody ProductRequestDTO request) {
        return ResponseEntity.ok(service.update(id, request, unitId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/add-stock")
    public ResponseEntity<ProductResponseDTO> addStock(@PathVariable UUID id,
                                                       @RequestParam UUID unitId,
                                                       @Valid @RequestBody StockMovementRequestDTO request) {
        return ResponseEntity.ok(service.addStock(id, unitId, request));
    }

    @PostMapping("/{id}/remove-stock")
    public ResponseEntity<ProductResponseDTO> removeStock(@PathVariable UUID id,
                                                          @RequestParam UUID unitId,
                                                          @Valid @RequestBody StockMovementRequestDTO request) {
        return ResponseEntity.ok(service.removeStock(id, unitId, request));
    }

    /** Transferencia entre os estoques das duas equipes. */
    @PostMapping("/{id}/transfer")
    public ResponseEntity<ProductResponseDTO> transfer(@PathVariable UUID id,
                                                       @Valid @RequestBody StockTransferRequestDTO request) {
        return ResponseEntity.ok(service.transfer(id, request));
    }
}
