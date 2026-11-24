package com.unimedvargina.UnimedVarginhaTi.modules.users.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.unimedvargina.UnimedVarginhaTi.shared.BaseEntity;
import com.unimedvargina.UnimedVarginhaTi.shared.model.Sector;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.jspecify.annotations.Nullable;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

/**
 * Usuario do sistema.
 *
 * <p>O que a pessoa pode fazer vem do {@link AccessProfile}, nao de um papel no
 * proprio usuario. O antigo campo {@code role} (ADMIN/USER) foi removido: manter os
 * dois seria ter duas fontes de verdade para a mesma pergunta, e a que de fato
 * governa os endpoints e o perfil.
 *
 * <p>O perfil e carregado junto (ManyToOne e EAGER por padrao) porque o
 * {@code SecurityFilter} le o usuario fora de transacao a cada requisicao.
 */
@Table(name = "users")
@Entity(name = "User")
@Getter
@Setter
@NoArgsConstructor
public class User extends BaseEntity implements UserDetails {

    private String name;

    private String email;

    @ManyToOne
    @JoinColumn(name = "sector_id")
    private Sector sector;

    private String login;

    @JsonIgnore
    private String password;

    @ManyToOne
    @JoinColumn(name = "profile_id")
    private AccessProfile profile;

    /**
     * Desligamento e desativacao, nunca exclusao: o historico de quem movimentou
     * estoque, criou pedido ou lancou nota precisa continuar rastreavel.
     */
    @Column(nullable = false)
    private boolean active = true;

    public User(String login, String name, String email, String password, AccessProfile profile) {
        this.login = login;
        this.name = name;
        this.email = email;
        this.password = password;
        this.profile = profile;
        this.active = true;
    }

    /** Nivel efetivo deste usuario em um modulo, para uma unidade. */
    public AccessLevel levelFor(AccessModule module, UUID unitId) {
        if (!active || profile == null) {
            return AccessLevel.NONE;
        }
        return profile.levelFor(module, unitId);
    }

    /**
     * A autorizacao real acontece nos {@code @PreAuthorize} sobre o bean de acesso,
     * que consulta o perfil. Aqui basta marcar que o usuario esta autenticado.
     */
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_USER"));
    }

    @Override
    public @Nullable String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return login;
    }

    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return true; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    /** Usuario desativado nao autentica — o login passa a ser recusado. */
    @Override
    public boolean isEnabled() { return active; }
}
