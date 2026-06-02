package com.unimedvargina.UnimedVarginhaTi.modules.financial.repository;

import com.unimedvargina.UnimedVarginhaTi.modules.financial.model.Apportionment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ApportionmentRepository extends JpaRepository<Apportionment, UUID> {
    List<Apportionment> findByInvoiceId(UUID invoiceId);
}
