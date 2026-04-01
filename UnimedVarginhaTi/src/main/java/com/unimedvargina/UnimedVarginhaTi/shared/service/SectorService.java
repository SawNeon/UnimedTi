package com.unimedvargina.UnimedVarginhaTi.shared.service;

import com.unimedvargina.UnimedVarginhaTi.shared.model.Sector;
import com.unimedvargina.UnimedVarginhaTi.shared.repository.SectorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Service
public class SectorService {

    @Autowired
    private SectorRepository sectorRepository;

    public Sector save(Sector sector) { return sectorRepository.save(sector); }
    public Iterable<Sector> findAll() { return sectorRepository.findAll(); }
    public Optional<Sector> findById(UUID id) { return sectorRepository.findById(id); }

}
