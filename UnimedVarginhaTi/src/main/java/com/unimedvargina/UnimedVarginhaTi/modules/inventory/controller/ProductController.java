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
import org.springframework.security.access.prepost.PreAuthorize;
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

    @PreAuthorize("@access.canOperate('STOCK', #unitId)")
    @PostMapping
    public ResponseEntity<ProductResponseDTO> create(@RequestParam UUID unitId,
                                                     @Valid @RequestBody ProductRequestDTO request) {
        return ResponseEntity.ok(service.create(request, unitId));
    }

    @PreAuthorize("@access.canRead('STOCK', #unitId)")
    @GetMapping
    public ResponseEntity<Page<ProductResponseDTO>> getProducts(
            @RequestParam UUID unitId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(service.listByUnit(unitId, page, size));
    }

    @PreAuthorize("@access.canOperate('STOCK', #unitId)")
    @PutMapping("/{id}")
    public ResponseEntity<ProductResponseDTO> update(@PathVariable UUID id,
                                                     @RequestParam UUID unitId,
                                                     @Valid @RequestBody ProductRequestDTO request) {
        return ResponseEntity.ok(service.update(id, request, unitId));
    }

    // Excluir tira o produto do catalogo, logo dos DOIS estoques: exige operar
    // em todas as unidades, nao so na que a pessoa atende.
    @PreAuthorize("@access.canOperateAllUnits('STOCK')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("@access.canOperate('STOCK', #unitId)")
    @PostMapping("/{id}/add-stock")
    public ResponseEntity<ProductResponseDTO> addStock(@PathVariable UUID id,
                                                       @RequestParam UUID unitId,
                                                       @Valid @RequestBody StockMovementRequestDTO request) {
        return ResponseEntity.ok(service.addStock(id, unitId, request));
    }

    @PreAuthorize("@access.canOperate('STOCK', #unitId)")
    @PostMapping("/{id}/remove-stock")
    public ResponseEntity<ProductResponseDTO> removeStock(@PathVariable UUID id,
                                                          @RequestParam UUID unitId,
                                                          @Valid @RequestBody StockMovementRequestDTO request) {
        return ResponseEntity.ok(service.removeStock(id, unitId, request));
    }

    /** Transferencia entre os estoques das duas equipes. */
    // Transferir mexe nos dois lados: precisa operar na origem E no destino.
    @PreAuthorize("@access.canOperate('STOCK', #request.fromUnitId()) and @access.canOperate('STOCK', #request.toUnitId())")
    @PostMapping("/{id}/transfer")
    public ResponseEntity<ProductResponseDTO> transfer(@PathVariable UUID id,
                                                       @Valid @RequestBody StockTransferRequestDTO request) {
        return ResponseEntity.ok(service.transfer(id, request));
    }
}
