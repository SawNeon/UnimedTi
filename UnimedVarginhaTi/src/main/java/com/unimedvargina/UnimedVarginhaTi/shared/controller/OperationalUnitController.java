package com.unimedvargina.UnimedVarginhaTi.shared.controller;

import com.unimedvargina.UnimedVarginhaTi.shared.model.OperationalUnit;
import com.unimedvargina.UnimedVarginhaTi.shared.repository.OperationalUnitRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Unidades operacionais disponiveis. Alimenta o seletor de estoque no frontend.
 *
 * <p>Somente leitura: as duas unidades vem do seed da migration. Criar unidade
 * pela API abriria a porta para um terceiro estoque sem que ninguem decidisse isso.
 */
@RestController
@RequestMapping("/api/units")
public class OperationalUnitController {

    @Autowired
    private OperationalUnitRepository repository;

    @GetMapping
    public ResponseEntity<List<OperationalUnit>> findAll() {
        return ResponseEntity.ok(repository.findAll());
    }
}
