package com.unimedvargina.UnimedVarginhaTi.modules.financial.repository;

import com.unimedvargina.UnimedVarginhaTi.modules.financial.model.Apportionment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ApportionmentRepository extends JpaRepository<Apportionment, UUID> {
}
