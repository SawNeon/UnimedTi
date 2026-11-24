package com.unimedvargina.UnimedVarginhaTi.modules.users.config;

import com.unimedvargina.UnimedVarginhaTi.modules.users.model.AccessProfile;
import com.unimedvargina.UnimedVarginhaTi.modules.users.model.User;
import com.unimedvargina.UnimedVarginhaTi.modules.users.repository.AccessProfileRepository;
import com.unimedvargina.UnimedVarginhaTi.modules.users.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Cria o primeiro administrador quando o banco sobe vazio.
 *
 * <p>Sem isto, uma instalacao nova fica inutilizavel: as migrations criam os
 * perfis e as permissoes, mas nenhum usuario, e {@code POST /api/users} exige
 * estar logado com USER_MANAGEMENT. Ninguem entra para criar o primeiro acesso.
 *
 * <p>So age com a tabela de usuarios <b>vazia</b>. A partir do momento em que
 * existe uma pessoa cadastrada, estas variaveis sao ignoradas para sempre --
 * entao deixar ADMIN_LOGIN no .env nao recria nem reescreve ninguem, e nao ha
 * como usar isto para repor a senha de um administrador existente.
 */
@Component
public class AdminInicial implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminInicial.class);

    /** Perfil semeado pela migration V3. */
    private static final String PERFIL_ADMINISTRADOR = "Administrador";

    private final UserRepository usuarios;
    private final AccessProfileRepository perfis;
    private final PasswordEncoder encoder;
    private final String login;
    private final String senha;
    private final String nome;
    private final String email;

    public AdminInicial(UserRepository usuarios,
                        AccessProfileRepository perfis,
                        PasswordEncoder encoder,
                        @Value("${admin-inicial.login:}") String login,
                        @Value("${admin-inicial.senha:}") String senha,
                        @Value("${admin-inicial.nome:Administrador}") String nome,
                        @Value("${admin-inicial.email:}") String email) {
        this.usuarios = usuarios;
        this.perfis = perfis;
        this.encoder = encoder;
        this.login = login;
        this.senha = senha;
        this.nome = nome;
        this.email = email;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (usuarios.count() > 0) {
            return;
        }

        if (login.isBlank() || senha.isBlank()) {
            log.warn("Banco sem nenhum usuario e ADMIN_LOGIN/ADMIN_SENHA nao definidos: "
                    + "ninguem consegue entrar. Defina as duas no .env e suba de novo.");
            return;
        }

        AccessProfile administrador = perfis.findAll().stream()
                .filter(perfil -> PERFIL_ADMINISTRADOR.equalsIgnoreCase(perfil.getName()))
                .findFirst()
                .orElse(null);

        if (administrador == null) {
            log.error("Perfil '{}' nao encontrado: o primeiro administrador nao foi criado. "
                    + "Confira se a migration V3 rodou.", PERFIL_ADMINISTRADOR);
            return;
        }

        usuarios.save(new User(
                login,
                nome,
                email.isBlank() ? null : email,
                encoder.encode(senha),
                administrador));

        // A senha nunca vai para o log: ela esta no .env, que e 600 no servidor.
        log.info("Primeiro acesso criado: usuario '{}' com o perfil '{}'. "
                + "Troque a senha depois de entrar.", login, PERFIL_ADMINISTRADOR);
    }
}
