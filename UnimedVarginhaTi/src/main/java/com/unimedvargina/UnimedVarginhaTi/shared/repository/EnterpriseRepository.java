package com.unimedvargina.UnimedVarginhaTi.shared.repository;

import com.unimedvargina.UnimedVarginhaTi.shared.model.Enterprise;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface EnterpriseRepository extends JpaRepository<Enterprise, UUID> {

    Optional<Enterprise> findByName(String name);
}
