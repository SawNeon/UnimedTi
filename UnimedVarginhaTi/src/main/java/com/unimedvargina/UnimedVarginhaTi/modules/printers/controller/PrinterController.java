package com.unimedvargina.UnimedVarginhaTi.modules.printers.controller;

import com.unimedvargina.UnimedVarginhaTi.modules.printers.dto.*;
import com.unimedvargina.UnimedVarginhaTi.modules.printers.service.PrinterClosingService;
import com.unimedvargina.UnimedVarginhaTi.modules.printers.service.PrintingPriceService;
import com.unimedvargina.UnimedVarginhaTi.modules.printers.service.PrinterReadingService;
import com.unimedvargina.UnimedVarginhaTi.modules.printers.service.PrinterService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * Parque de impressoras e fechamento mensal de contagem.
 *
 * <p>O cadastro e configuracao e exige USER_MANAGEMENT, como empresas e setores.
 * O fechamento e rotina do modulo e exige PRINTER.
 */
@RestController
@RequestMapping("/api/printers")
public class PrinterController {

    @Autowired
    private PrinterService printerService;

    @Autowired
    private PrinterReadingService readingService;

    @Autowired
    private PrinterClosingService closingService;

    @Autowired
    private PrintingPriceService priceService;

    @PreAuthorize("@access.canRead('PRINTER')")
    @GetMapping
    public ResponseEntity<List<PrinterResponseDTO>> findAll() {
        return ResponseEntity.ok(printerService.listAll());
    }

    @PreAuthorize("@access.canOperate('USER_MANAGEMENT')")
    @PostMapping
    public ResponseEntity<PrinterResponseDTO> create(@Valid @RequestBody PrinterRequestDTO request) {
        return ResponseEntity.ok(printerService.create(request));
    }

    @PreAuthorize("@access.canOperate('USER_MANAGEMENT')")
    @PutMapping("/{id}")
    public ResponseEntity<PrinterResponseDTO> update(@PathVariable UUID id,
                                                     @Valid @RequestBody PrinterRequestDTO request) {
        return ResponseEntity.ok(printerService.update(id, request));
    }

    /** Recusado quando a impressora ja tem leitura lancada; use inativar. */
    @PreAuthorize("@access.canOperate('USER_MANAGEMENT')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        printerService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("@access.canRead('PRINTER')")
    @GetMapping("/readings")
    public ResponseEntity<List<ReadingResponseDTO>> readings(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate competence) {
        return ResponseEntity.ok(readingService.listByCompetence(competence));
    }

    /** Abre o mes com o contador inicial vindo do fechamento anterior. */
    @PreAuthorize("@access.canOperate('PRINTER')")
    @PostMapping("/readings/open")
    public ResponseEntity<List<ReadingResponseDTO>> openCompetence(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate competence) {
        return ResponseEntity.ok(readingService.openCompetence(competence));
    }

    @PreAuthorize("@access.canOperate('PRINTER')")
    @PostMapping(value = "/readings/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ImportResultDTO> importPrintWay(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate competence,
            @RequestPart("file") MultipartFile file) {
        return ResponseEntity.ok(readingService.importPrintWay(competence, file));
    }

    /** Lancamento manual ou correcao de um numero vindo do PrintWay. */
    @PreAuthorize("@access.canOperate('PRINTER')")
    @PutMapping("/readings/{id}")
    public ResponseEntity<ReadingResponseDTO> updateReading(@PathVariable UUID id,
                                                            @Valid @RequestBody ReadingUpdateDTO request) {
        return ResponseEntity.ok(readingService.update(id, request));
    }

    /**
     * Fechamento do mes: custo por empresa, rateio por centro de custo e o que
     * ainda impede fechar com confianca.
     */
    @PreAuthorize("@access.canRead('PRINTER')")
    @GetMapping("/closing")
    public ResponseEntity<ClosingDTO> closing(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate competence) {
        return ResponseEntity.ok(closingService.calculate(competence));
    }

    @PreAuthorize("@access.canRead('PRINTER')")
    @GetMapping("/prices")
    public ResponseEntity<List<PriceResponseDTO>> prices() {
        return ResponseEntity.ok(priceService.listPrices());
    }

    /** Grava o preço a partir do mês informado; meses anteriores seguem no antigo. */
    @PreAuthorize("@access.canOperate('USER_MANAGEMENT')")
    @PostMapping("/prices")
    public ResponseEntity<PriceResponseDTO> savePrice(@Valid @RequestBody PriceRequestDTO request) {
        return ResponseEntity.ok(priceService.savePrice(request));
    }

    @PreAuthorize("@access.canRead('PRINTER')")
    @GetMapping("/terms")
    public ResponseEntity<List<TermsResponseDTO>> terms() {
        return ResponseEntity.ok(priceService.listTerms());
    }

    @PreAuthorize("@access.canOperate('USER_MANAGEMENT')")
    @PostMapping("/terms")
    public ResponseEntity<TermsResponseDTO> saveTerms(@Valid @RequestBody TermsRequestDTO request) {
        return ResponseEntity.ok(priceService.saveTerms(request));
    }
}
