package com.unimedvargina.UnimedVarginhaTi.modules.assets.service;

import com.unimedvargina.UnimedVarginhaTi.modules.assets.model.Asset;
import com.unimedvargina.UnimedVarginhaTi.modules.assets.model.AssetMovements;
import com.unimedvargina.UnimedVarginhaTi.modules.assets.model.AssetStatus;
import com.unimedvargina.UnimedVarginhaTi.modules.assets.repository.AssetMovementsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class AssetMovementService {

    @Autowired
    private AssetMovementsRepository assetMovementsRepository;

    @Autowired
    private AssetService assetService;

    public AssetMovements createMovement(UUID id, AssetMovements movement) {

        Asset asset = assetService.findById(id);

        if ("OUT".equalsIgnoreCase(movement.getType()) || "SAIDA".equalsIgnoreCase(movement.getType())) {
            asset.setStatus(AssetStatus.UNAVAILABLE);
            assetService.update(asset);
        }

        movement.setAsset(asset);

        movement.setResponsible(getUsuarioLogado());

        return assetMovementsRepository.save(movement);
    }

    private String getUsuarioLogado() {
        return "Usuario_TI_Padrao";
    }

    public AssetMovements returnAsset(UUID assetId) {

        AssetMovements openMovement = assetMovementsRepository.findFirstByAssetIdAndActualReturnDateIsNullOrderByCreatedAtDesc(assetId).orElseThrow(() -> new RuntimeException(("Not exist movement for this asset.")));

        openMovement.setActualReturnDate(LocalDateTime.now());

        Asset asset = openMovement.getAsset();
        asset.setStatus(AssetStatus.AVAILABLE);


        assetService.update(asset);

        return assetMovementsRepository.save(openMovement);
    }
}
