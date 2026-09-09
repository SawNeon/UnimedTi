package com.unimedvargina.UnimedVarginhaTi.modules.financial.model;

import com.unimedvargina.UnimedVarginhaTi.shared.BaseEntity;
import com.unimedvargina.UnimedVarginhaTi.shared.model.Enterprise;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name="contracts")
@Getter
@Setter
@NoArgsConstructor
public class Contract extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "enterprise_id", nullable = false)
    private Enterprise enterprise;

    @Column(nullable = false)
    private String serviceType;

    @Column(nullable = false)
    private String serviceDescription;

    @Column(nullable = false)
    private LocalDate startDate;

    private LocalDate endDate;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private ContractStatus status;

    /**
     * Rateio padrao entre centros de custo. Alimenta a primeira nota do contrato,
     * quando nao ha mes anterior de onde copiar. Vazio e valido: nem todo contrato
     * e rateado -- ha os de custo integral do CNPJ.
     */
    @OneToMany(mappedBy = "contract", cascade = CascadeType.ALL, orphanRemoval = true,
            fetch = FetchType.EAGER)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private List<ContractSectorShare> defaultShares = new ArrayList<>();

}
