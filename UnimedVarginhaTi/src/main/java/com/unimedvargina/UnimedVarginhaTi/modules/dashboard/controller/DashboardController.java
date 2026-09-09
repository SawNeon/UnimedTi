package com.unimedvargina.UnimedVarginhaTi.modules.dashboard.controller;

import com.unimedvargina.UnimedVarginhaTi.modules.dashboard.dto.ContractsDashboardDTO;
import com.unimedvargina.UnimedVarginhaTi.modules.dashboard.dto.PrintersDashboardDTO;
import com.unimedvargina.UnimedVarginhaTi.modules.dashboard.service.ContractsDashboardService;
import com.unimedvargina.UnimedVarginhaTi.modules.dashboard.service.PrintersDashboardService;
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
 * Paineis de gestao -- um por planilha de origem.
 *
 * <p>Sao dois porque respondem a perguntas diferentes e tem donos diferentes: o de
 * contratos e o gasto do TI, o de impressoras e volume e repasse aos setores.
 * Cada um exige a permissao do seu proprio modulo, entao quem so cuida de um lado
 * nao fica sem painel nenhum.
 */
@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private ContractsDashboardService contractsService;

    @Autowired
    private PrintersDashboardService printersService;

    @PreAuthorize("@access.canRead('FINANCIAL')")
    @GetMapping("/contracts")
    public ResponseEntity<ContractsDashboardDTO> contracts(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate competence,
            @RequestParam(defaultValue = "13") int months) {
        return ResponseEntity.ok(contractsService.build(competence, months));
    }

    @PreAuthorize("@access.canRead('PRINTER')")
    @GetMapping("/printers")
    public ResponseEntity<PrintersDashboardDTO> printers(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate competence,
            @RequestParam(defaultValue = "13") int months) {
        return ResponseEntity.ok(printersService.build(competence, months));
    }
}
