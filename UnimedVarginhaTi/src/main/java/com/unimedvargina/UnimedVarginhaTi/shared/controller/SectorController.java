package com.unimedvargina.UnimedVarginhaTi.shared.controller;

import com.unimedvargina.UnimedVarginhaTi.shared.model.Sector;
import com.unimedvargina.UnimedVarginhaTi.shared.service.SectorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/sectors")
public class SectorController {

    @Autowired
    private SectorService sectorService;

    @GetMapping
    public Iterable<Sector> findAll() { return sectorService.findAll(); }

    @PostMapping
    public Sector save(@RequestBody Sector sector) { return sectorService.save(sector); }
}
