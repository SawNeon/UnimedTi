package com.unimedvargina.UnimedVarginhaTi.modules.financial.repository;

import com.unimedvargina.UnimedVarginhaTi.modules.financial.model.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

public interface InvoiceRepository extends JpaRepository<Invoice, UUID> {

    /**
     * A nota do contrato naquele mes de referencia.
     *
     * <p>Busca pela competencia, e nao pela data de emissao: no historico ha nota
     * emitida em abril que pertence ao controle de maio.
     */
    Optional<Invoice> findByContractIdAndCompetence(UUID contractId, LocalDate competence);
}
