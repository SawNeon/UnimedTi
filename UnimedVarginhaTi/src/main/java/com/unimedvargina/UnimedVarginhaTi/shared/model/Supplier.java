package com.unimedvargina.UnimedVarginhaTi.shared.model;

import com.unimedvargina.UnimedVarginhaTi.shared.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Quem emite a nota.
 *
 * <p>Nao se confunde com {@link Enterprise}: aquela e o CNPJ da Unimed que paga e
 * a quem pertencem os centros de custo; esta e a empresa do outro lado do
 * contrato. Um contrato tem os dois -- quem paga e quem fornece.
 */
@Entity
@Table(name = "suppliers")
@Getter @Setter @NoArgsConstructor
public class Supplier extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String name;

    /** CNPJ como esta na nota. Guardado como texto, sem mascara imposta. */
    private String document;

    private String notes;

    /**
     * Fornecedor encerrado sai das listas sem sumir do historico. Excluir de vez so
     * e possivel enquanto nenhum contrato apontar para ele.
     */
    @Column(nullable = false)
    private boolean active = true;
}
