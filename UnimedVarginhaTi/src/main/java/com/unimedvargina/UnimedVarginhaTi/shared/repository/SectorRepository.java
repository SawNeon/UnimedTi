package com.unimedvargina.UnimedVarginhaTi.shared.repository;

import com.unimedvargina.UnimedVarginhaTi.shared.model.Sector;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SectorRepository extends JpaRepository<Sector, UUID> {
    List<Sector> findByEnterpriseId(UUID enterpriseId);
    Optional<Sector> findByName(String name);
}
