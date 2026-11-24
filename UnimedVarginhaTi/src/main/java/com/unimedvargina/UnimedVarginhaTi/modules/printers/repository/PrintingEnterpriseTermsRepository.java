package com.unimedvargina.UnimedVarginhaTi.modules.printers.repository;

import com.unimedvargina.UnimedVarginhaTi.modules.printers.model.PrintingEnterpriseTerms;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PrintingEnterpriseTermsRepository extends JpaRepository<PrintingEnterpriseTerms, UUID> {

    Optional<PrintingEnterpriseTerms> findFirstByEnterpriseIdAndValidFromLessThanEqualOrderByValidFromDesc(
            UUID enterpriseId, LocalDate competence);

    List<PrintingEnterpriseTerms> findAllByOrderByValidFromDesc();
}
