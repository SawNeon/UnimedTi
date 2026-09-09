package com.unimedvargina.UnimedVarginhaTi.modules.users.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.unimedvargina.UnimedVarginhaTi.shared.BaseEntity;
import com.unimedvargina.UnimedVarginhaTi.shared.model.OperationalUnit;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Uma linha de permissao: modulo x unidade x nivel.
 *
 * <p>{@code unit} nulo significa "todas as unidades" — e o caso do administrador e
 * de quem coordena as duas equipes.
 */
@Entity
@Table(name = "access_profile_permissions")
@Getter
@Setter
@NoArgsConstructor
public class AccessProfilePermission extends BaseEntity {

    @ManyToOne(optional = false)
    @JoinColumn(name = "profile_id", nullable = false)
    @JsonIgnore
    private AccessProfile profile;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AccessModule module;

    /** Nulo = vale para todas as unidades. */
    @ManyToOne
    @JoinColumn(name = "unit_id")
    private OperationalUnit unit;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AccessLevel level;

    public AccessProfilePermission(AccessProfile profile, AccessModule module,
                                   OperationalUnit unit, AccessLevel level) {
        this.profile = profile;
        this.module = module;
        this.unit = unit;
        this.level = level;
    }
}
