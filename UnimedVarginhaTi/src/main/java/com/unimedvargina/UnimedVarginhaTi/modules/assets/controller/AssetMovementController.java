package com.unimedvargina.UnimedVarginhaTi.modules.assets.controller;

import com.unimedvargina.UnimedVarginhaTi.modules.assets.model.AssetMovements;
import com.unimedvargina.UnimedVarginhaTi.modules.assets.service.AssetMovementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/assets/{assetId}/movements")
public class AssetMovementController {

    @Autowired
    private AssetMovementService service;

    @PreAuthorize("@access.canOperate('ASSET')")
    @PostMapping
    public ResponseEntity<AssetMovements> create(
            @PathVariable UUID assetId,
            @RequestBody AssetMovements movement) {

        AssetMovements savedMovement = service.createMovement(assetId, movement);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedMovement);
    }

    @PreAuthorize("@access.canOperate('ASSET')")
    @PatchMapping("/return")
    public ResponseEntity<AssetMovements> returnAsset(@PathVariable UUID assetId) {
        AssetMovements closedMovement = service.returnAsset(assetId);
        return ResponseEntity.ok(closedMovement);
    }
}
