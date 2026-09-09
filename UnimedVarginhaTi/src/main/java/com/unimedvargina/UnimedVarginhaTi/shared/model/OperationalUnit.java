package com.unimedvargina.UnimedVarginhaTi.shared.model;

import com.unimedvargina.UnimedVarginhaTi.shared.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Unidade operacional: o "lado" responsável pelo dado.
 *
 * <p>O setor de TI opera em duas equipes separadas por distância — Operadora
 * (matriz, Getúlio Vargas e seccionais) e Hospital (hospital, APS e serviços
 * próprios). A divisão segue geografia, não CNPJ: a APS pertence à operadora mas
 * quem a atende é a equipe do hospital.
 *
 * <p>Por isso esta é uma dimensão própria, e não um derivado de {@link Enterprise}
 * (que representa o CNPJ) nem de {@link Sector} (que representa o local de consumo).
 */
@Entity
@Table(name = "operational_units")
@Getter
@Setter
@NoArgsConstructor
public class OperationalUnit extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String name;

    /** Identificador estável para código e seeds — não muda se o nome for reescrito. */
    @Column(nullable = false, unique = true)
    private String slug;
}
