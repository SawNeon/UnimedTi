package com.unimedvargina.UnimedVarginhaTi.shared.service;

import com.unimedvargina.UnimedVarginhaTi.shared.dto.SectorRequestDTO;
import com.unimedvargina.UnimedVarginhaTi.shared.dto.SectorResponseDTO;
import com.unimedvargina.UnimedVarginhaTi.shared.exception.BusinessRuleException;
import com.unimedvargina.UnimedVarginhaTi.shared.exception.ResourceNotFoundException;
import com.unimedvargina.UnimedVarginhaTi.shared.model.Enterprise;
import com.unimedvargina.UnimedVarginhaTi.shared.model.Sector;
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
 * Cadastro dos setores, que sao os centros de custo do rateio.
 *
 * <p>Cada setor pertence a uma empresa e carrega o codigo contabil
 * ({@code costCenterCode}) e o agrupamento usado nos relatorios
 * ({@code groupName}: "2. Produtivos", "3. Apoios").
 */
@Service
public class SectorService {

    @Autowired
    private SectorRepository sectorRepository;

    @Autowired
    private EnterpriseRepository enterpriseRepository;

    @Autowired
    private ReferenceGuard referenceGuard;

    public List<SectorResponseDTO> listAll() {
        return sectorRepository.findAll().stream()
                .sorted(Comparator.comparing(Sector::getName, String.CASE_INSENSITIVE_ORDER))
                .map(SectorResponseDTO::from)
                .toList();
    }

    /** Usado pelo rateio de nota fiscal para resolver o setor informado. */
    public Optional<Sector> findById(UUID id) {
        return sectorRepository.findById(id);
    }

    public List<Sector> findByEnterpriseId(UUID enterpriseId) {
        return sectorRepository.findByEnterpriseId(enterpriseId);
    }

    @Transactional
    public SectorResponseDTO create(SectorRequestDTO request) {
        requireNameAvailable(request.name(), null);

        Sector sector = new Sector();
        applyTo(sector, request);

        return SectorResponseDTO.from(sectorRepository.save(sector));
    }

    @Transactional
    public SectorResponseDTO update(UUID id, SectorRequestDTO request) {
        Sector sector = requireSector(id);
        requireNameAvailable(request.name(), id);

        applyTo(sector, request);

        return SectorResponseDTO.from(sectorRepository.save(sector));
    }

    /**
     * Exclui somente se nada mais apontar para o setor.
     *
     * <p>Setor referenciado por movimentacao, pedido ou rateio nao pode sumir: o
     * historico perderia o destino do consumo e do custo. A recusa diz exatamente o
     * que esta preso, para o operador saber o que desfazer antes.
     */
    @Transactional
    public void delete(UUID id) {
        Sector sector = requireSector(id);

        Map<String, Long> usages = referenceGuard.sectorUsages(id);
        if (!usages.isEmpty()) {
            throw new BusinessRuleException(
                    "O setor %s não pode ser excluído: existem %s vinculados a ele."
                            .formatted(sector.getName(), ReferenceGuard.describe(usages)));
        }

        sectorRepository.delete(sector);
    }

    private void applyTo(Sector sector, SectorRequestDTO request) {
        Enterprise enterprise = enterpriseRepository.findById(request.enterpriseId())
                .orElseThrow(() -> new ResourceNotFoundException("Empresa", request.enterpriseId()));

        sector.setName(request.name().trim());
        sector.setEnterprise(enterprise);
        sector.setGroupName(request.groupName().trim());
        sector.setCostCenterCode(request.costCenterCode());
    }

    private Sector requireSector(UUID id) {
        return sectorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Setor", id));
    }

    /**
     * O nome e unico no banco. Checar antes transforma uma violacao de constraint,
     * que chegaria como erro tecnico, em uma mensagem que diz o que houve.
     */
    private void requireNameAvailable(String name, UUID ignoredId) {
        sectorRepository.findByName(name.trim())
                .filter(other -> ignoredId == null || !other.getId().equals(ignoredId))
                .ifPresent(duplicated -> {
                    throw new BusinessRuleException("Já existe um setor com o nome " + duplicated.getName() + ".");
                });
    }
}
