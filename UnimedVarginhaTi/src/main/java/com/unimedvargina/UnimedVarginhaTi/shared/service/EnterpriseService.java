package com.unimedvargina.UnimedVarginhaTi.shared.service;

import com.unimedvargina.UnimedVarginhaTi.shared.model.Enterprise;
import com.unimedvargina.UnimedVarginhaTi.shared.repository.EnterpriseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Service
public class EnterpriseService {

    @Autowired
    private EnterpriseRepository enterpriseRepository;

    public Enterprise save(Enterprise enterprise) { return enterpriseRepository.save(enterprise); }
    public Iterable<Enterprise> findAll() { return enterpriseRepository.findAll(); }
    public Optional<Enterprise> findById(UUID id){ return enterpriseRepository.findById(id); }
}
