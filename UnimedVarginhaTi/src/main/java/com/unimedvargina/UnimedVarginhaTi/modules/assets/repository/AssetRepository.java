package com.unimedvargina.UnimedVarginhaTi.modules.assets.repository;

import com.unimedvargina.UnimedVarginhaTi.modules.assets.model.Asset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface AssetsRepository extends JpaRepository<Asset, UUID> {
}
