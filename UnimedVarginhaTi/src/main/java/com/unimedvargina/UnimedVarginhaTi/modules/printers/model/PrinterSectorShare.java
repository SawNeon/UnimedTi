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
 * Quanto de uma impressora pertence a um setor, em percentual.
 *
 * <p>Impressora dividida entre setores rateia o consumo conforme o combinado, e
 * nao meio a meio por suposicao. A soma dos percentuais de uma impressora tem de
 * fechar 100 -- validado no service.
 */
@Entity
@Table(name = "printer_sector_shares")
@Getter
@Setter
@NoArgsConstructor
public class PrinterSectorShare extends BaseEntity {

    @ManyToOne(optional = false)
    @JoinColumn(name = "printer_id", nullable = false)
    @JsonIgnore
    private Printer printer;

    @ManyToOne(optional = false)
    @JoinColumn(name = "sector_id", nullable = false)
    private Sector sector;

    @Column(nullable = false, precision = 7, scale = 4)
    private BigDecimal percentage;

    public PrinterSectorShare(Printer printer, Sector sector, BigDecimal percentage) {
        this.printer = printer;
        this.sector = sector;
        this.percentage = percentage;
    }
}
