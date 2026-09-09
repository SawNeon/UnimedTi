package com.unimedvargina.UnimedVarginhaTi.shared.model;

import com.unimedvargina.UnimedVarginhaTi.shared.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "sectors")
@Getter @Setter @NoArgsConstructor
public class Sector extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String name;
    @ManyToOne
    @JoinColumn(name = "enterprise_id")
    private Enterprise enterprise;

    @Column(nullable = false)
    private String groupName;

    /**
     * Codigo do centro de custo no plano de contas da empresa. E texto porque a
     * Operadora usa codigo pontuado ("5.09") e o Hospital usa inteiro ("167").
     */
    @Column(nullable = false)
    private String costCenterCode;

    /**
     * Codigo do mesmo setor no Piramide -- o que o Financeiro digita para lancar a
     * nota. No Hospital coincide com o centro de custo; na Operadora nao (o centro
     * de custo 5.09 e o Piramide 219).
     */
    @Column(name = "pyramid_code")
    private String pyramidCode;

}
