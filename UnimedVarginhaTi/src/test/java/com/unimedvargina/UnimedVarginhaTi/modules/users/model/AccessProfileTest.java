package com.unimedvargina.UnimedVarginhaTi.modules.users.model;

import com.unimedvargina.UnimedVarginhaTi.shared.model.OperationalUnit;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Field;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Testes da decisao de permissao.
 *
 * <p>E a logica que os {@code @PreAuthorize} consultam a cada requisicao: se ela
 * errar para mais, abre acesso indevido; se errar para menos, trava o operador.
 * Por isso os casos negativos importam tanto quanto os positivos.
 */
class AccessProfileTest {

    private static final UUID OPERADORA = UUID.fromString("11111111-1111-1111-1111-111111111111");
    private static final UUID HOSPITAL = UUID.fromString("22222222-2222-2222-2222-222222222222");

    @Nested
    @DisplayName("AccessLevel.allows")
    class Levels {

        @Test
        void operarImplicaLer() {
            assertTrue(AccessLevel.OPERATE.allows(AccessLevel.READ));
            assertTrue(AccessLevel.OPERATE.allows(AccessLevel.OPERATE));
        }

        @Test
        void lerNaoImplicaOperar() {
            assertTrue(AccessLevel.READ.allows(AccessLevel.READ));
            assertFalse(AccessLevel.READ.allows(AccessLevel.OPERATE));
        }

        @Test
        void nenhumNivelNaoAlcancaNada() {
            assertFalse(AccessLevel.NONE.allows(AccessLevel.READ));
            assertFalse(AccessLevel.NONE.allows(AccessLevel.OPERATE));
        }
    }

    @Nested
    @DisplayName("Perfil restrito a uma unidade")
    class PerfilDeUmaUnidade {

        private AccessProfile perfilHospital() {
            AccessProfile profile = new AccessProfile("TI Hospital", "Equipe do hospital");
            profile.getPermissions().add(new AccessProfilePermission(
                    profile, AccessModule.STOCK, unit(HOSPITAL), AccessLevel.OPERATE));
            return profile;
        }

        @Test
        void operaOEstoqueDaPropriaUnidade() {
            assertEquals(AccessLevel.OPERATE, perfilHospital().levelFor(AccessModule.STOCK, HOSPITAL));
        }

        @Test
        void naoAlcancaOEstoqueDaOutraUnidade() {
            assertEquals(AccessLevel.NONE, perfilHospital().levelFor(AccessModule.STOCK, OPERADORA));
        }

        @Test
        void naoAlcancaModuloQueNaoTemPermissao() {
            assertEquals(AccessLevel.NONE, perfilHospital().levelFor(AccessModule.FINANCIAL, HOSPITAL));
            assertEquals(AccessLevel.NONE, perfilHospital().levelFor(AccessModule.USER_MANAGEMENT, HOSPITAL));
        }

        @Test
        void naoCobreTodasAsUnidades() {
            assertFalse(perfilHospital().coversAllUnits(AccessModule.STOCK, AccessLevel.OPERATE));
        }
    }

    @Nested
    @DisplayName("Perfil sem unidade vale para todas")
    class PerfilGlobal {

        private AccessProfile administrador() {
            AccessProfile profile = new AccessProfile("Administrador", "Acesso total");
            profile.getPermissions().add(new AccessProfilePermission(
                    profile, AccessModule.STOCK, null, AccessLevel.OPERATE));
            return profile;
        }

        @Test
        void alcancaQualquerUnidade() {
            assertEquals(AccessLevel.OPERATE, administrador().levelFor(AccessModule.STOCK, HOSPITAL));
            assertEquals(AccessLevel.OPERATE, administrador().levelFor(AccessModule.STOCK, OPERADORA));
        }

        @Test
        void cobreTodasAsUnidades() {
            assertTrue(administrador().coversAllUnits(AccessModule.STOCK, AccessLevel.OPERATE));
        }

        @Test
        void leituraGlobalNaoAutorizaOperacaoEmTodasAsUnidades() {
            AccessProfile leitor = new AccessProfile("Auditor", "Somente leitura");
            leitor.getPermissions().add(new AccessProfilePermission(
                    leitor, AccessModule.FINANCIAL, null, AccessLevel.READ));

            assertTrue(leitor.coversAllUnits(AccessModule.FINANCIAL, AccessLevel.READ));
            assertFalse(leitor.coversAllUnits(AccessModule.FINANCIAL, AccessLevel.OPERATE));
        }
    }

    @Test
    @DisplayName("Havendo linhas concorrentes, vence a mais permissiva")
    void venceAMaisPermissiva() {
        AccessProfile profile = new AccessProfile("Misto", null);
        profile.getPermissions().add(new AccessProfilePermission(
                profile, AccessModule.STOCK, null, AccessLevel.READ));
        profile.getPermissions().add(new AccessProfilePermission(
                profile, AccessModule.STOCK, unit(HOSPITAL), AccessLevel.OPERATE));

        assertEquals(AccessLevel.OPERATE, profile.levelFor(AccessModule.STOCK, HOSPITAL));
        assertEquals(AccessLevel.READ, profile.levelFor(AccessModule.STOCK, OPERADORA));
    }

    @Nested
    @DisplayName("Usuario")
    class Usuario {

        @Test
        void usuarioDesativadoNaoAlcancaNada() {
            User user = usuarioComPerfilTotal();
            user.setActive(false);

            assertEquals(AccessLevel.NONE, user.levelFor(AccessModule.STOCK, HOSPITAL));
            assertFalse(user.isEnabled());
        }

        @Test
        void usuarioSemPerfilNaoAlcancaNada() {
            User user = new User();
            user.setActive(true);

            assertEquals(AccessLevel.NONE, user.levelFor(AccessModule.STOCK, HOSPITAL));
        }

        @Test
        void usuarioAtivoComPerfilAlcanca() {
            User user = usuarioComPerfilTotal();

            assertEquals(AccessLevel.OPERATE, user.levelFor(AccessModule.STOCK, HOSPITAL));
            assertTrue(user.isEnabled());
        }

        private User usuarioComPerfilTotal() {
            AccessProfile profile = new AccessProfile("Administrador", null);
            profile.getPermissions().add(new AccessProfilePermission(
                    profile, AccessModule.STOCK, null, AccessLevel.OPERATE));

            User user = new User("joao", "Joao", "joao@local", "hash", profile);
            user.setActive(true);
            return user;
        }
    }

    /** O id normalmente vem do banco; aqui e fixado para o teste comparar unidades. */
    private static OperationalUnit unit(UUID id) {
        OperationalUnit unit = new OperationalUnit();
        try {
            Field field = unit.getClass().getSuperclass().getDeclaredField("id");
            field.setAccessible(true);
            field.set(unit, id);
        } catch (ReflectiveOperationException e) {
            throw new IllegalStateException(e);
        }
        return unit;
    }
}
