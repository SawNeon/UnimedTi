package com.unimedvargina.UnimedVarginhaTi.modules.printers.repository;

import com.unimedvargina.UnimedVarginhaTi.modules.printers.model.PrinterReading;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PrinterReadingRepository extends JpaRepository<PrinterReading, UUID> {

    Optional<PrinterReading> findByPrinterIdAndCompetence(UUID printerId, LocalDate competence);

    List<PrinterReading> findByCompetence(LocalDate competence);
}
