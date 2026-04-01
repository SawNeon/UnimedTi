package com.unimedvargina.UnimedVarginhaTi.shared.controller;

import com.unimedvargina.UnimedVarginhaTi.shared.model.Enterprise;
import com.unimedvargina.UnimedVarginhaTi.shared.model.Sector;
import com.unimedvargina.UnimedVarginhaTi.shared.service.EnterpriseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/enterprises")
public class EnterpriseController {

    @Autowired
    private EnterpriseService serviceEnterprise;

    @GetMapping
    public Iterable<Enterprise> findAll() { return serviceEnterprise.findAll(); }

    @PostMapping
    public Enterprise save(@RequestBody Enterprise enterprise) { return serviceEnterprise.save(enterprise); }
}
