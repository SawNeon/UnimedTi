package com.unimedvargina.UnimedVarginhaTi.modules.financial.controller;

import com.unimedvargina.UnimedVarginhaTi.modules.financial.dto.InvoiceApportionmentTemplateDTO;
import com.unimedvargina.UnimedVarginhaTi.modules.financial.dto.InvoiceRequestDTO;
import com.unimedvargina.UnimedVarginhaTi.modules.financial.dto.InvoiceResponseDTO;
import com.unimedvargina.UnimedVarginhaTi.modules.financial.model.Invoice;
import com.unimedvargina.UnimedVarginhaTi.modules.financial.service.InvoiceService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping("/api/invoices")
public class InvoiceController {
    @Autowired
    private InvoiceService invoiceService;

    @PreAuthorize("@access.canOperate('FINANCIAL')")
    @PostMapping
    public ResponseEntity<Invoice> create(@Valid @RequestBody InvoiceRequestDTO invoice){
        Invoice savedInvoice = invoiceService.createInvoiceWithApportionment(invoice);
        return ResponseEntity.ok(savedInvoice);
    }

    @PreAuthorize("@access.canRead('FINANCIAL')")
    @GetMapping("/{id}")
    public ResponseEntity<InvoiceResponseDTO> findById(@PathVariable UUID id) {
        InvoiceResponseDTO invoice = invoiceService.findByIdWithApportionments(id);
        return ResponseEntity.ok(invoice);
    }

    @PreAuthorize("@access.canRead('FINANCIAL')")
    @GetMapping("/contracts/{contractId}/apportionment-template")
    public ResponseEntity<InvoiceApportionmentTemplateDTO> findPreviousMonthApportionmentTemplate(
            @PathVariable UUID contractId,
            @RequestParam LocalDate referenceDate
    ) {
        return invoiceService.findPreviousMonthApportionmentTemplate(contractId, referenceDate)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.noContent().build());
    }

    /** Registra a entrega da nota ao Suporte Adm ou ao Financeiro. */
    @PreAuthorize("@access.canOperate('FINANCIAL')")
    @PatchMapping("/{id}/delivered")
    public ResponseEntity<InvoiceResponseDTO> markAsDelivered(
            @PathVariable UUID id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate deliveredAt) {
        return ResponseEntity.ok(invoiceService.markAsDelivered(id, deliveredAt));
    }
}
