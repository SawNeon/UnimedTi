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

    /** Codigo do centro de custo. E o numero: 167 no Hospital, 219 na Operadora. */
    @Column(nullable = false)
    private String costCenterCode;

    /**
     * Codigo do mesmo setor no Piramide, que e pontuado ("5.09"). So a Operadora
     * tem: no Hospital o proprio centro de custo ja e o que se lanca. E texto
     * justamente por causa do ponto -- "5.09" nao cabe em integer, e guardar 509
     * perderia onde o ponto fica.
     */
    @Column(name = "pyramid_code")
    private String pyramidCode;

}
