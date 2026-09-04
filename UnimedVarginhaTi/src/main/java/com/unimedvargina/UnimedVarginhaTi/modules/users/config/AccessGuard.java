package com.unimedvargina.UnimedVarginhaTi.modules.users.config;

import com.unimedvargina.UnimedVarginhaTi.modules.users.model.AccessLevel;
import com.unimedvargina.UnimedVarginhaTi.modules.users.model.AccessModule;
import com.unimedvargina.UnimedVarginhaTi.modules.users.model.User;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Avaliador de permissao usado nos {@code @PreAuthorize} dos controllers.
 *
 * <p>Registrado como {@code "access"} para as anotacoes ficarem legiveis:
 * <pre>{@code @PreAuthorize("@access.canOperate('STOCK', #unitId)")}</pre>
 *
 * <p>Este e o unico lugar que decide acesso. O frontend esconder um botao e
 * conveniencia de tela — sem esta checagem, um curl com token passaria por cima.
 */
@Component("access")
public class AccessGuard {

    /** Leitura no modulo, em qualquer unidade que o perfil alcance. */
    public boolean canRead(String module) {
        return has(module, null, AccessLevel.READ);
    }

    /** Leitura no modulo, especificamente nesta unidade. */
    public boolean canRead(String module, UUID unitId) {
        return has(module, unitId, AccessLevel.READ);
    }

    public boolean canOperate(String module) {
        return has(module, null, AccessLevel.OPERATE);
    }

    public boolean canOperate(String module, UUID unitId) {
        return has(module, unitId, AccessLevel.OPERATE);
    }

    /** Leitura em pelo menos um dos modulos — para recursos compartilhados. */
    public boolean canReadAny(String moduleA, String moduleB) {
        return canRead(moduleA) || canRead(moduleB);
    }

    /**
     * Operacao valida em TODAS as unidades. Exigido pelo que afeta os dois estoques
     * de uma vez: excluir um produto do catalogo tira o item da matriz e do
     * hospital, entao operar so em um dos lados nao basta.
     */
    public boolean canOperateAllUnits(String moduleName) {
        User user = currentUser();
        if (user == null || !user.isActive() || user.getProfile() == null) {
            return false;
        }

        AccessModule module;
        try {
            module = AccessModule.valueOf(moduleName);
        } catch (IllegalArgumentException ex) {
            return false;
        }

        return user.getProfile().coversAllUnits(module, AccessLevel.OPERATE);
    }

    private boolean has(String moduleName, UUID unitId, AccessLevel required) {
        User user = currentUser();
        if (user == null) {
            return false;
        }

        AccessModule module;
        try {
            module = AccessModule.valueOf(moduleName);
        } catch (IllegalArgumentException ex) {
            // Modulo escrito errado na anotacao nao pode virar acesso liberado.
            return false;
        }

        return user.levelFor(module, unitId).allows(required);
    }

    /** Usuario autenticado, ou {@code null} quando nao ha um. */
    public User currentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof User user)) {
            return null;
        }
        return user;
    }
}
