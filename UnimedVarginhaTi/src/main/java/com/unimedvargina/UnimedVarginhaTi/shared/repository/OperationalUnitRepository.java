package com.unimedvargina.UnimedVarginhaTi.shared.repository;

import com.unimedvargina.UnimedVarginhaTi.shared.model.OperationalUnit;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface OperationalUnitRepository extends JpaRepository<OperationalUnit, UUID> {

    Optional<OperationalUnit> findBySlug(String slug);
}
