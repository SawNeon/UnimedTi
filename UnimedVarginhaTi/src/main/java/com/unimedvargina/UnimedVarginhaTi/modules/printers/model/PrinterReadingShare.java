package com.unimedvargina.UnimedVarginhaTi.modules.printers.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.unimedvargina.UnimedVarginhaTi.shared.BaseEntity;
import com.unimedvargina.UnimedVarginhaTi.shared.model.Sector;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

/**
 * Rateio efetivamente aplicado naquele mes.
 *
 * <p>O rateio tende a ser o mesmo todo mes, mas pode mudar -- abrir um setor novo,
 * por exemplo. Guardar a divisao junto da leitura permite alterar o mes corrente
 * sem reescrever o que ja foi cobrado nos meses anteriores.
 *
 * <p>Nasce como copia do padrao da impressora ({@link PrinterSectorShare}) quando
 * a leitura e criada.
 */
@Entity
@Table(name = "printer_reading_shares")
@Getter
@Setter
@NoArgsConstructor
public class PrinterReadingShare extends BaseEntity {

    @ManyToOne(optional = false)
    @JoinColumn(name = "reading_id", nullable = false)
    @JsonIgnore
    private PrinterReading reading;

    @ManyToOne(optional = false)
    @JoinColumn(name = "sector_id", nullable = false)
    private Sector sector;

    @Column(nullable = false, precision = 7, scale = 4)
    private BigDecimal percentage;

    public PrinterReadingShare(PrinterReading reading, Sector sector, BigDecimal percentage) {
        this.reading = reading;
        this.sector = sector;
        this.percentage = percentage;
    }
}
