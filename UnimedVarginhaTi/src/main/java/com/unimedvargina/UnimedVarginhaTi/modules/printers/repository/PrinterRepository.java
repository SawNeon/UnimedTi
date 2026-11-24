package com.unimedvargina.UnimedVarginhaTi.modules.printers.repository;

import com.unimedvargina.UnimedVarginhaTi.modules.printers.model.Printer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PrinterRepository extends JpaRepository<Printer, UUID> {

    /** A serie e a chave que liga o cadastro a leitura do PrintWay. */
    Optional<Printer> findBySerialNumber(String serialNumber);

    List<Printer> findByActiveTrue();
}
