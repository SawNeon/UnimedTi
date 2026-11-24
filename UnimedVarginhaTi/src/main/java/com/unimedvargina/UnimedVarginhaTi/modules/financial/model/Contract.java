package com.unimedvargina.UnimedVarginhaTi.modules.financial.model;

import com.unimedvargina.UnimedVarginhaTi.shared.BaseEntity;
import com.unimedvargina.UnimedVarginhaTi.shared.model.Enterprise;
import com.unimedvargina.UnimedVarginhaTi.shared.model.Supplier;
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

    /** O CNPJ da Unimed que paga a conta. */
    @ManyToOne
    @JoinColumn(name = "enterprise_id", nullable = false)
    private Enterprise enterprise;

    /**
     * A empresa que emite a nota. Aceita nulo por causa do contrato antigo, que foi
     * cadastrado antes deste campo existir -- a tela pede, mas o banco nao pode
     * recusar o historico que ja esta la.
     */
    @ManyToOne
    @JoinColumn(name = "supplier_id")
    private Supplier supplier;

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
