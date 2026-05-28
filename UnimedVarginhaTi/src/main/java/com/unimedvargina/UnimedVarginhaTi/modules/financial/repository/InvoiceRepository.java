package com.unimedvargina.UnimedVarginhaTi.modules.financial.repository;

import com.unimedvargina.UnimedVarginhaTi.modules.financial.model.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

public interface InvoiceRepository extends JpaRepository<Invoice, UUID> {

    @Query("SELECT i FROM Invoice i WHERE i.contract.id = :contractId " +
            "AND i.issueDate BETWEEN :startDate AND :endDate")
    Optional<Invoice> findByContractIdAndMonthRange(
            @Param("contractId") UUID contractId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );
}