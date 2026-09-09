package com.unimedvargina.UnimedVarginhaTi.modules.printers.service;

import com.unimedvargina.UnimedVarginhaTi.modules.printers.dto.PriceRequestDTO;
import com.unimedvargina.UnimedVarginhaTi.modules.printers.dto.PriceResponseDTO;
import com.unimedvargina.UnimedVarginhaTi.modules.printers.dto.TermsRequestDTO;
import com.unimedvargina.UnimedVarginhaTi.modules.printers.dto.TermsResponseDTO;
import com.unimedvargina.UnimedVarginhaTi.modules.printers.model.PrintingEnterpriseTerms;
import com.unimedvargina.UnimedVarginhaTi.modules.printers.model.PrintingPrice;
import com.unimedvargina.UnimedVarginhaTi.modules.printers.repository.PrintingEnterpriseTermsRepository;
import com.unimedvargina.UnimedVarginhaTi.modules.printers.repository.PrintingPriceRepository;
import com.unimedvargina.UnimedVarginhaTi.shared.exception.ResourceNotFoundException;
import com.unimedvargina.UnimedVarginhaTi.shared.model.Enterprise;
import com.unimedvargina.UnimedVarginhaTi.shared.repository.EnterpriseRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

/**
 * Preco da pagina e condicoes por empresa, versionados por vigencia.
 *
 * <p>Salvar sempre cria ou substitui a vigencia daquele mes, nunca a anterior. E o
 * que permite corrigir o contrato sem reescrever meses ja fechados: um mes antigo
 * continua resolvendo para a vigencia que valia nele.
 */
@Service
public class PrintingPriceService {

    @Autowired
    private PrintingPriceRepository priceRepository;

    @Autowired
    private PrintingEnterpriseTermsRepository termsRepository;

    @Autowired
    private EnterpriseRepository enterpriseRepository;

    public List<PriceResponseDTO> listPrices() {
        return priceRepository.findAllByOrderByValidFromDesc().stream()
                .map(PriceResponseDTO::from)
                .toList();
    }

    public List<TermsResponseDTO> listTerms() {
        return termsRepository.findAllByOrderByValidFromDesc().stream()
                .map(TermsResponseDTO::from)
                .toList();
    }

    /**
     * Grava o preco valido a partir do mes informado. Repetir o mesmo mes
     * sobrescreve aquela vigencia; escolher um mes novo abre outra, e os meses
     * anteriores seguem no preco antigo.
     */
    @Transactional
    public PriceResponseDTO savePrice(PriceRequestDTO request) {
        LocalDate vigencia = YearMonth.from(request.validFrom()).atDay(1);

        PrintingPrice price = priceRepository.findAllByOrderByValidFromDesc().stream()
                .filter(p -> p.getValidFrom().equals(vigencia))
                .findFirst()
                .orElseGet(PrintingPrice::new);

        price.setValidFrom(vigencia);
        price.setBlackPageCost(request.blackPageCost());
        price.setColorPageCost(request.colorPageCost());

        return PriceResponseDTO.from(priceRepository.save(price));
    }

    @Transactional
    public TermsResponseDTO saveTerms(TermsRequestDTO request) {
        LocalDate vigencia = YearMonth.from(request.validFrom()).atDay(1);

        Enterprise enterprise = enterpriseRepository.findById(request.enterpriseId())
                .orElseThrow(() -> new ResourceNotFoundException("Empresa", request.enterpriseId()));

        PrintingEnterpriseTerms terms = termsRepository.findAllByOrderByValidFromDesc().stream()
                .filter(t -> t.getValidFrom().equals(vigencia)
                        && t.getEnterprise().getId().equals(enterprise.getId()))
                .findFirst()
                .orElseGet(PrintingEnterpriseTerms::new);

        terms.setValidFrom(vigencia);
        terms.setEnterprise(enterprise);
        terms.setColorFranchiseLimit(request.colorFranchiseLimit());
        terms.setColorFranchiseValue(request.colorFranchiseValue());
        terms.setFixedCharge(request.fixedCharge());
        terms.setIncludedInTotal(request.includedInTotal());

        return TermsResponseDTO.from(termsRepository.save(terms));
    }
}
