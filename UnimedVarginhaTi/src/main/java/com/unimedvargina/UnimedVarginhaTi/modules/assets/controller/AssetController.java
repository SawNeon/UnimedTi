package com.unimedvargina.UnimedVarginhaTi.modules.assets.controller;

import com.unimedvargina.UnimedVarginhaTi.modules.assets.model.Asset;
import com.unimedvargina.UnimedVarginhaTi.modules.assets.model.AssetMovements;
import com.unimedvargina.UnimedVarginhaTi.modules.assets.service.AssetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/assets")
public class AssetController {

    @Autowired
    private AssetService service;

    @PostMapping
    public ResponseEntity<Asset> save(@RequestBody Asset asset) {
        Asset savedAsset = service.create(asset);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedAsset);
    }
    @GetMapping("/{id}")
    public ResponseEntity<Asset> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.findById(id));
    }


}
