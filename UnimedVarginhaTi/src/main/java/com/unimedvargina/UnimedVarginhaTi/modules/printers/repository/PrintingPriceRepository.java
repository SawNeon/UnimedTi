package com.unimedvargina.UnimedVarginhaTi.modules.printers.repository;

import com.unimedvargina.UnimedVarginhaTi.modules.printers.model.PrintingPrice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PrintingPriceRepository extends JpaRepository<PrintingPrice, UUID> {

    /** Vigencia que vale para a competencia: a mais recente que ja comecou. */
    Optional<PrintingPrice> findFirstByValidFromLessThanEqualOrderByValidFromDesc(LocalDate competence);

    List<PrintingPrice> findAllByOrderByValidFromDesc();
}
