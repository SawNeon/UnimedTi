package com.unimedvargina.UnimedVarginhaTi.shared.service;

import com.unimedvargina.UnimedVarginhaTi.shared.dto.SupplierRequestDTO;
import com.unimedvargina.UnimedVarginhaTi.shared.dto.SupplierResponseDTO;
import com.unimedvargina.UnimedVarginhaTi.shared.exception.BusinessRuleException;
import com.unimedvargina.UnimedVarginhaTi.shared.exception.ResourceNotFoundException;
import com.unimedvargina.UnimedVarginhaTi.shared.model.Supplier;
import com.unimedvargina.UnimedVarginhaTi.shared.repository.SupplierRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/**
 * Cadastro das empresas fornecedoras.
 *
 * <p>Fornecedor encerrado se desativa em vez de sumir: o contrato antigo continua
 * apontando para ele, e sem o nome a nota do ano passado perderia de quem era.
 */
@Service
public class SupplierService {

    @Autowired
    private SupplierRepository repository;

    @Autowired
    private ReferenceGuard referenceGuard;

    public List<SupplierResponseDTO> listAll() {
        return repository.findAll().stream()
                .sorted(Comparator.comparing(Supplier::getName, String.CASE_INSENSITIVE_ORDER))
                .map(SupplierResponseDTO::from)
                .toList();
    }

    public Optional<Supplier> findById(UUID id) {
        return repository.findById(id);
    }

    @Transactional
    public SupplierResponseDTO create(SupplierRequestDTO request) {
        requireNameAvailable(request.name(), null);

        Supplier supplier = new Supplier();
        applyTo(supplier, request);

        return SupplierResponseDTO.from(repository.save(supplier));
    }

    @Transactional
    public SupplierResponseDTO update(UUID id, SupplierRequestDTO request) {
        Supplier supplier = require(id);
        requireNameAvailable(request.name(), id);

        applyTo(supplier, request);

        return SupplierResponseDTO.from(repository.save(supplier));
    }

    /** Exclui so enquanto nenhum contrato apontar. Com contrato, desative. */
    @Transactional
    public void delete(UUID id) {
        Supplier supplier = require(id);

        Map<String, Long> usages = referenceGuard.supplierUsages(id);
        if (!usages.isEmpty()) {
            throw new BusinessRuleException(
                    "O fornecedor %s não pode ser excluído: existem %s vinculados a ele. Desative-o."
                            .formatted(supplier.getName(), ReferenceGuard.describe(usages)));
        }

        repository.delete(supplier);
    }

    private void applyTo(Supplier supplier, SupplierRequestDTO request) {
        supplier.setName(request.name().trim());
        supplier.setDocument(vazioViraNulo(request.document()));
        supplier.setNotes(vazioViraNulo(request.notes()));
        supplier.setActive(request.active() == null || request.active());
    }

    private static String vazioViraNulo(String valor) {
        return valor == null || valor.isBlank() ? null : valor.trim();
    }

    private Supplier require(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fornecedor", id));
    }

    /**
     * O nome e unico no banco. Checar antes transforma uma violacao de constraint,
     * que chegaria como erro tecnico, em uma mensagem que diz o que houve.
     */
    private void requireNameAvailable(String name, UUID ignoredId) {
        repository.findByName(name.trim())
                .filter(other -> ignoredId == null || !other.getId().equals(ignoredId))
                .ifPresent(duplicated -> {
                    throw new BusinessRuleException(
                            "Já existe um fornecedor com o nome " + duplicated.getName() + ".");
                });
    }
}
