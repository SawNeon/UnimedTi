package com.unimedvargina.UnimedVarginhaTi.modules.financial.service;

import com.unimedvargina.UnimedVarginhaTi.modules.financial.model.Contract;
import com.unimedvargina.UnimedVarginhaTi.modules.financial.repository.ContractRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class ContractService {

    @Autowired
    private ContractRepository  contractRepository;

    public Contract save(Contract contract) { return contractRepository.save(contract); }

    public Contract findById(UUID id) { return contractRepository.findById(id).orElseThrow(() -> new RuntimeException("Contract not found!"));}

    public List<Contract> findAll() { return contractRepository.findAll(); }

    public Contract update(Contract contract) { return contractRepository.save(contract); }

    public Page<Contract> getAllContractsPaginated(int page, int size) {
        return contractRepository.findAll(PageRequest.of(page, size));
    }
}
