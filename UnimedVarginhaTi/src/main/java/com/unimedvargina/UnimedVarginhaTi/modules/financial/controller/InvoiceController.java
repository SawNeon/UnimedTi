package com.unimedvargina.UnimedVarginhaTi.modules.financial.controller;

import com.unimedvargina.UnimedVarginhaTi.modules.financial.dto.InvoiceRequestDTO;
import com.unimedvargina.UnimedVarginhaTi.modules.financial.dto.InvoiceResponseDTO;
import com.unimedvargina.UnimedVarginhaTi.modules.financial.model.Invoice;
import com.unimedvargina.UnimedVarginhaTi.modules.financial.service.InvoiceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/invoices")
public class InvoiceController {
    @Autowired
    private InvoiceService invoiceService;

    @PostMapping
    public ResponseEntity<Invoice> create(@RequestBody InvoiceRequestDTO invoice){
        Invoice savedInvoice = invoiceService.createInvoiceWithApportionment(invoice);
        return ResponseEntity.ok(savedInvoice);
    }

    @GetMapping("/{id}")
    public ResponseEntity<InvoiceResponseDTO> findById(@PathVariable UUID id) {
        InvoiceResponseDTO invoice = invoiceService.findByIdWithApportionments(id);
        return ResponseEntity.ok(invoice);
    }
}
