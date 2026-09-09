package com.unimedvargina.UnimedVarginhaTi.shared.service;

import com.unimedvargina.UnimedVarginhaTi.shared.dto.EnterpriseRequestDTO;
import com.unimedvargina.UnimedVarginhaTi.shared.dto.EnterpriseResponseDTO;
import com.unimedvargina.UnimedVarginhaTi.shared.exception.BusinessRuleException;
import com.unimedvargina.UnimedVarginhaTi.shared.exception.ResourceNotFoundException;
import com.unimedvargina.UnimedVarginhaTi.shared.model.Enterprise;
import com.unimedvargina.UnimedVarginhaTi.shared.repository.EnterpriseRepository;
import com.unimedvargina.UnimedVarginhaTi.shared.repository.SectorRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/**
 * Cadastro das empresas (CNPJ) do grupo.
 *
 * <p>Sao poucas e mudam raramente, mas sustentam o Fiscal: contrato e nota
 * pertencem a uma delas, e o custo sem rateio vai integral para o CNPJ.
 */
@Service
public class EnterpriseService {

    @Autowired
    private EnterpriseRepository enterpriseRepository;

    @Autowired
    private SectorRepository sectorRepository;

    @Autowired
    private ReferenceGuard referenceGuard;

    public List<EnterpriseResponseDTO> listAll() {
        return enterpriseRepository.findAll().stream()
                .sorted(Comparator.comparing(Enterprise::getName, String.CASE_INSENSITIVE_ORDER))
                .map(enterprise -> EnterpriseResponseDTO.from(
                        enterprise,
                        sectorRepository.findByEnterpriseId(enterprise.getId()).size()))
                .toList();
    }

    public Optional<Enterprise> findById(UUID id) {
        return enterpriseRepository.findById(id);
    }

    @Transactional
    public EnterpriseResponseDTO create(EnterpriseRequestDTO request) {
        requireNameAvailable(request.name(), null);

        Enterprise enterprise = new Enterprise();
        enterprise.setName(request.name().trim());
        enterprise.setLocale(request.locale().trim());

        return EnterpriseResponseDTO.from(enterpriseRepository.save(enterprise), 0);
    }

    @Transactional
    public EnterpriseResponseDTO update(UUID id, EnterpriseRequestDTO request) {
        Enterprise enterprise = requireEnterprise(id);
        requireNameAvailable(request.name(), id);

        enterprise.setName(request.name().trim());
        enterprise.setLocale(request.locale().trim());

        return EnterpriseResponseDTO.from(
                enterpriseRepository.save(enterprise),
                sectorRepository.findByEnterpriseId(id).size());
    }

    /**
     * Exclui somente se nada mais apontar para a empresa.
     *
     * <p>Empresa com setor ou contrato ligado nao pode sumir: o historico perderia
     * o dono. A recusa diz exatamente o que esta preso, para o operador saber o que
     * desfazer antes.
     */
    @Transactional
    public void delete(UUID id) {
        Enterprise enterprise = requireEnterprise(id);

        Map<String, Long> usages = referenceGuard.enterpriseUsages(id);
        if (!usages.isEmpty()) {
            throw new BusinessRuleException(
                    "A empresa %s não pode ser excluída: existem %s vinculados a ela."
                            .formatted(enterprise.getName(), ReferenceGuard.describe(usages)));
        }

        enterpriseRepository.delete(enterprise);
    }

    private Enterprise requireEnterprise(UUID id) {
        return enterpriseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Empresa", id));
    }

    /**
     * O nome e unico no banco. Checar antes transforma uma violacao de constraint,
     * que chegaria como erro tecnico, em uma mensagem que diz o que houve.
     */
    private void requireNameAvailable(String name, UUID ignoredId) {
        enterpriseRepository.findAll().stream()
                .filter(other -> other.getName().equalsIgnoreCase(name.trim()))
                .filter(other -> ignoredId == null || !other.getId().equals(ignoredId))
                .findFirst()
                .ifPresent(duplicated -> {
                    throw new BusinessRuleException("Já existe uma empresa com o nome " + duplicated.getName() + ".");
                });
    }
}
