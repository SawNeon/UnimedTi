package com.unimedvargina.UnimedVarginhaTi.modules.dashboard.controller;

import com.unimedvargina.UnimedVarginhaTi.modules.dashboard.dto.DashboardDTO;
import com.unimedvargina.UnimedVarginhaTi.modules.dashboard.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

/**
 * Painel de gestao.
 *
 * <p>Reune custo de contratos e de impressoras, entao exige leitura nos dois
 * modulos: um painel que some metade dos numeros por falta de permissao mostraria
 * um total errado sem dizer que esta incompleto.
 */
@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private DashboardService service;

    @PreAuthorize("@access.canRead('FINANCIAL') and @access.canRead('PRINTER')")
    @GetMapping
    public ResponseEntity<DashboardDTO> get(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate competence,
            @RequestParam(defaultValue = "13") int months) {
        return ResponseEntity.ok(service.build(competence, months));
    }
}
