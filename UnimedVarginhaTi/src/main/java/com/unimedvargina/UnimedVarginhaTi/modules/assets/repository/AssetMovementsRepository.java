package com.unimedvargina.UnimedVarginhaTi.modules.assets.repository;

import com.unimedvargina.UnimedVarginhaTi.modules.assets.model.Asset;
import com.unimedvargina.UnimedVarginhaTi.modules.assets.model.AssetMovements;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AssetMovementsRepository extends JpaRepository<AssetMovements, UUID> {

    List<AssetMovements> findByAssetId(UUID assetId);

}
