package com.unimedvargina.UnimedVarginhaTi.modules.inventory.repository;

import com.unimedvargina.UnimedVarginhaTi.modules.inventory.model.ProductStockBalance;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ProductStockBalanceRepository extends JpaRepository<ProductStockBalance, UUID> {

    Optional<ProductStockBalance> findByProductIdAndUnitId(UUID productId, UUID unitId);

    /** Página de saldos de uma unidade — é a listagem do estoque daquela equipe. */
    Page<ProductStockBalance> findByUnitId(UUID unitId, Pageable pageable);

    void deleteByProductId(UUID productId);
}
