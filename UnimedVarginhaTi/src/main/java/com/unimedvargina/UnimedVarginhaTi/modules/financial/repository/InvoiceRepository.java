package com.unimedvargina.UnimedVarginhaTi.modules.financial.repository;

import com.unimedvargina.UnimedVarginhaTi.modules.financial.model.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, UUID> {

}
