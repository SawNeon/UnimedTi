package com.unimedvargina.UnimedVarginhaTi.modules.users.model;

import com.unimedvargina.UnimedVarginhaTi.shared.BaseEntity;
import com.unimedvargina.UnimedVarginhaTi.shared.model.OperationalUnit;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Perfil de acesso reutilizavel — "TI Operadora", "TI Hospital", "Administrador".
 *
 * <p>A permissao mora no perfil, nao no usuario: mudar o que a equipe do hospital
 * pode fazer e uma edicao so, e nao um ajuste repetido em cada pessoa.
 *
 * <p>As permissoes sao carregadas junto (EAGER) de proposito. O
 * {@code SecurityFilter} busca o usuario fora de transacao a cada requisicao, e
 * uma colecao lazy estouraria na hora de avaliar o {@code @PreAuthorize}.
 */
@Entity
@Table(name = "access_profiles")
@Getter
@Setter
@NoArgsConstructor
public class AccessProfile extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String name;

    private String description;

    @OneToMany(mappedBy = "profile", cascade = CascadeType.ALL, orphanRemoval = true,
            fetch = FetchType.EAGER)
    private List<AccessProfilePermission> permissions = new ArrayList<>();

    public AccessProfile(String name, String description) {
        this.name = name;
        this.description = description;
    }

    /**
     * Nivel efetivo do perfil em um modulo, para uma unidade.
     *
     * <p>Permissao com unidade nula vale para todas. Havendo mais de uma linha
     * aplicavel, vence a mais permissiva — e o comportamento previsivel: adicionar
     * uma permissao nunca tira acesso que ja existia.
     */
    public AccessLevel levelFor(AccessModule module, UUID unitId) {
        AccessLevel effective = AccessLevel.NONE;

        for (AccessProfilePermission permission : permissions) {
            if (permission.getModule() != module) {
                continue;
            }

            OperationalUnit unit = permission.getUnit();
            boolean appliesToUnit = unit == null || unitId == null || unit.getId().equals(unitId);
            if (!appliesToUnit) {
                continue;
            }

            if (permission.getLevel().allows(effective)) {
                effective = permission.getLevel();
            }
        }

        return effective;
    }

    /**
     * Verdadeiro quando o perfil tem o nivel exigido em TODAS as unidades, e nao
     * apenas em uma. Exigido por operacoes que afetam os dois estoques de uma vez —
     * excluir um produto do catalogo, por exemplo.
     */
    public boolean coversAllUnits(AccessModule module, AccessLevel required) {
        return permissions.stream()
                .anyMatch(p -> p.getModule() == module
                        && p.getUnit() == null
                        && p.getLevel().allows(required));
    }
}
