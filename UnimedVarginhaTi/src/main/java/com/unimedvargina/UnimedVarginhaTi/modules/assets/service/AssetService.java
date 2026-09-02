package com.unimedvargina.UnimedVarginhaTi.modules.assets.service;

import com.unimedvargina.UnimedVarginhaTi.modules.assets.model.Asset;
import com.unimedvargina.UnimedVarginhaTi.modules.assets.repository.AssetRepository;
import com.unimedvargina.UnimedVarginhaTi.shared.exception.BusinessRuleException;
import com.unimedvargina.UnimedVarginhaTi.shared.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class AssetService {

    @Autowired
    private AssetRepository repository;

    public Asset create(Asset asset) {
        if (repository.existsByAssetTag(asset.getAssetTag())) {
            throw new BusinessRuleException(
                    "Já existe um ativo cadastrado com a etiqueta " + asset.getAssetTag() + ".");
        }
        return repository.save(asset);
    }

    public List<Asset> findAll() {
        return repository.findAll();
    }

    public Asset findById(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ativo", id));
    }

    public Asset update(Asset asset) {
        return repository.save(asset);
    }

    public Page<Asset> getAllAssetsPaginated(int page, int size) {
        return repository.findAll(PageRequest.of(page, size));
    }
}
