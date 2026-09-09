package com.unimedvargina.UnimedVarginhaTi.modules.printers.model;

import com.unimedvargina.UnimedVarginhaTi.shared.BaseEntity;
import com.unimedvargina.UnimedVarginhaTi.shared.model.Enterprise;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

/**
 * Impressora do parque.
 *
 * <p>Corresponde a uma linha do cadastro BD da planilha. A serie e a chave que
 * liga o cadastro a leitura do PrintWay -- e por ela que o import se encontra.
 */
@Entity
@Table(name = "printers")
@Getter
@Setter
@NoArgsConstructor
public class Printer extends BaseEntity {

    @Column(name = "serial_number", nullable = false, unique = true)
    private String serialNumber;

    @Column(name = "asset_tag")
    private String assetTag;

    private String model;

    @Column(name = "ip_address")
    private String ipAddress;

    @ManyToOne(optional = false)
    @JoinColumn(name = "enterprise_id", nullable = false)
    private Enterprise enterprise;

    /**
     * Falso para as impressoras que o PrintWay nao le e alguem digita todo mes.
     * Na planilha era a coluna PRINTWAY, com OK ou PEDENTE.
     */
    @Column(name = "auto_read", nullable = false)
    private boolean autoRead = true;

    /** Reserva: circula entre setores, e o rateio costuma sair so quando ha uso. */
    @Column(nullable = false)
    private boolean backup = false;

    @Column(nullable = false)
    private boolean active = true;

    @OneToMany(mappedBy = "printer", cascade = CascadeType.ALL, orphanRemoval = true,
            fetch = FetchType.EAGER)
    private List<PrinterSectorShare> shares = new ArrayList<>();
}
