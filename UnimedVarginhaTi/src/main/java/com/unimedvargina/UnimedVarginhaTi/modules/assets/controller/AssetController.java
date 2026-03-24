package com.unimedvargina.UnimedVarginhaTi.modules.assets.controller;

import com.unimedvargina.UnimedVarginhaTi.modules.assets.model.Asset;
import com.unimedvargina.UnimedVarginhaTi.modules.assets.model.AssetMovements;
import com.unimedvargina.UnimedVarginhaTi.modules.assets.service.AssetService;
import com.unimedvargina.UnimedVarginhaTi.modules.inventory.model.Product;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/assets")
public class AssetController {

    @Autowired
    private AssetService service;

    @PutMapping("/{id}")
    public ResponseEntity<Asset> updateAsset(@PathVariable UUID id, @RequestBody Asset asset) {
        asset.setId(id);
        Asset updatedAsset = service.update(asset);
        return ResponseEntity.ok(updatedAsset);
    }

    @PostMapping
    public ResponseEntity<Asset> save(@RequestBody Asset asset) {
        Asset savedAsset = service.create(asset);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedAsset);
    }
    @GetMapping("/{id}")
    public ResponseEntity<Asset> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @GetMapping
    public ResponseEntity<List<Asset>> findAll() {return ResponseEntity.ok(service.findAll());}

}
