package com.unimedvargina.UnimedVarginhaTi.shared.repository;

import com.unimedvargina.UnimedVarginhaTi.shared.model.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface SupplierRepository extends JpaRepository<Supplier, UUID> {

    Optional<Supplier> findByName(String name);
}
