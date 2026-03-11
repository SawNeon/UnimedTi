package com.unimedvargina.UnimedVarginhaTi.modules.assets.service;

import com.unimedvargina.UnimedVarginhaTi.modules.assets.model.Asset;
import com.unimedvargina.UnimedVarginhaTi.modules.assets.model.AssetMovements;
import com.unimedvargina.UnimedVarginhaTi.modules.assets.repository.AssetMovementsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class AssetMovementService {

    @Autowired
    private AssetMovementsRepository assetMovementsRepository;

    @Autowired
    private AssetService assetService;

    public AssetMovements createMovement(UUID id, AssetMovements movement) {

        Asset asset = assetService.findById(id);

        movement.setAsset(asset);

        movement.setResponsible(getUsuarioLogado());

        return assetMovementsRepository.save(movement);
    }

    private String getUsuarioLogado() {
        return "Usuario_TI_Padrao";
    }
}
