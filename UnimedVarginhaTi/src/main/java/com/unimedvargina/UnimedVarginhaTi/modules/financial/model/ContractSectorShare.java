package com.unimedvargina.UnimedVarginhaTi.modules.financial.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.unimedvargina.UnimedVarginhaTi.shared.BaseEntity;
import com.unimedvargina.UnimedVarginhaTi.shared.model.Sector;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

/**
 * Rateio padrao do contrato entre centros de custo, em percentual.
 *
 * <p>E o PADRAO, nao o que foi cobrado. O rateio cobrado vive em
 * {@link Apportionment}, preso a nota daquele mes -- por isso alterar este padrao
 * nunca reescreve uma nota ja emitida.
 *
 * <p>Serve para a PRIMEIRA nota do contrato, quando nao existe mes anterior de
 * onde copiar a divisao.
 */
@Entity
@Table(name = "contract_sector_shares")
@Getter
@Setter
@NoArgsConstructor
public class ContractSectorShare extends BaseEntity {

    @ManyToOne(optional = false)
    @JoinColumn(name = "contract_id", nullable = false)
    @JsonIgnore
    private Contract contract;

    @ManyToOne(optional = false)
    @JoinColumn(name = "sector_id", nullable = false)
    private Sector sector;

    @Column(nullable = false, precision = 7, scale = 4)
    private BigDecimal percentage;

    public ContractSectorShare(Contract contract, Sector sector, BigDecimal percentage) {
        this.contract = contract;
        this.sector = sector;
        this.percentage = percentage;
    }
}
