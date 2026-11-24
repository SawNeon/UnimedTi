package com.unimedvargina.UnimedVarginhaTi.modules.printers.model;

import com.unimedvargina.UnimedVarginhaTi.shared.BaseEntity;
import com.unimedvargina.UnimedVarginhaTi.shared.model.Enterprise;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Condicoes do contrato de impressao para uma empresa, validas a partir de uma
 * competencia.
 *
 * <p>A franquia e por CNPJ porque o contrato negocia limites diferentes: hoje
 * 1.000 paginas coloridas no Hospital e 2.000 na Operadora, ambas por R$ 911,41.
 */
@Entity
@Table(name = "printing_enterprise_terms")
@Getter
@Setter
@NoArgsConstructor
public class PrintingEnterpriseTerms extends BaseEntity {

    @Column(name = "valid_from", nullable = false)
    private LocalDate validFrom;

    @ManyToOne(optional = false)
    @JoinColumn(name = "enterprise_id", nullable = false)
    private Enterprise enterprise;

    /**
     * Ate este numero de paginas coloridas cobra-se o valor fixo da franquia;
     * acima dele, cobra-se por pagina. Zero desliga a franquia.
     */
    @Column(name = "color_franchise_limit", nullable = false)
    private Integer colorFranchiseLimit = 0;

    @Column(name = "color_franchise_value", nullable = false, precision = 12, scale = 2)
    private BigDecimal colorFranchiseValue = BigDecimal.ZERO;

    /** Acrescimo fixo mensal, como o Plantao do Hospital. */
    @Column(name = "fixed_charge", nullable = false, precision = 12, scale = 2)
    private BigDecimal fixedCharge = BigDecimal.ZERO;

    /**
     * Falso para a empresa que e servico proprio e fica fora do total, como a
     * Ressoar. Na planilha essa exclusao vivia implicita na formula do total.
     */
    @Column(name = "included_in_total", nullable = false)
    private boolean includedInTotal = true;
}
