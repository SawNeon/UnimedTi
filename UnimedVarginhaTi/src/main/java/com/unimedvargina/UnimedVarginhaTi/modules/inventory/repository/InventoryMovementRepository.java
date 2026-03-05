package com.unimedvargina.UnimedVarginhaTi.modules.inventory.repository;

import com.unimedvargina.UnimedVarginhaTi.modules.inventory.model.InventoryMovements;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface InventoryMovementRepository extends JpaRepository<InventoryMovements, UUID> {

}
