package com.unimedvargina.UnimedVarginhaTi.modules.printers.model;

import com.unimedvargina.UnimedVarginhaTi.shared.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Preco da pagina, valido A PARTIR de uma competencia.
 *
 * <p>Continua valendo ate alguem definir outro. Mudar o preco em outubro nao toca
 * setembro, porque setembro resolve para a vigencia anterior -- e por isso que
 * corrigir o contrato nao reescreve mes ja fechado.
 */
@Entity
@Table(name = "printing_prices")
@Getter
@Setter
@NoArgsConstructor
public class PrintingPrice extends BaseEntity {

    @Column(name = "valid_from", nullable = false, unique = true)
    private LocalDate validFrom;

    @Column(name = "black_page_cost", nullable = false, precision = 12, scale = 6)
    private BigDecimal blackPageCost;

    @Column(name = "color_page_cost", nullable = false, precision = 12, scale = 6)
    private BigDecimal colorPageCost;
}
