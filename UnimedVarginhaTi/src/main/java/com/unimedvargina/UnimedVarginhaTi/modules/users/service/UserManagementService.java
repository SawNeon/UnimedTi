package com.unimedvargina.UnimedVarginhaTi.modules.users.service;

import com.unimedvargina.UnimedVarginhaTi.modules.users.config.AccessGuard;
import com.unimedvargina.UnimedVarginhaTi.modules.users.dto.*;
import com.unimedvargina.UnimedVarginhaTi.modules.users.model.*;
import com.unimedvargina.UnimedVarginhaTi.modules.users.repository.AccessProfileRepository;
import com.unimedvargina.UnimedVarginhaTi.modules.users.repository.UserRepository;
import com.unimedvargina.UnimedVarginhaTi.shared.exception.BusinessRuleException;
import com.unimedvargina.UnimedVarginhaTi.shared.exception.ResourceNotFoundException;
import com.unimedvargina.UnimedVarginhaTi.shared.model.OperationalUnit;
import com.unimedvargina.UnimedVarginhaTi.shared.repository.OperationalUnitRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Gestao de usuarios e perfis de acesso.
 *
 * <p>As travas aqui existem para evitar o cenario em que ninguem mais consegue
 * administrar o sistema. Sao regras de negocio, e nao de tela: precisam valer
 * mesmo para uma chamada direta na API.
 */
@Service
public class UserManagementService {

    @Autowired
    private UserRepository repository;

    @Autowired
    private AccessProfileRepository profileRepository;

    @Autowired
    private OperationalUnitRepository unitRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AccessGuard accessGuard;

    public List<UserResponseDTO> listAll() {
        return repository.findAll().stream()
                .sorted((a, b) -> String.valueOf(a.getName()).compareToIgnoreCase(String.valueOf(b.getName())))
                .map(UserResponseDTO::from)
                .toList();
    }

    public List<AccessProfileResponseDTO> listProfiles() {
        return profileRepository.findAll().stream()
                .map(AccessProfileResponseDTO::from)
                .toList();
    }

    @Transactional
    public UserResponseDTO create(UserRequestDTO request) {
        if (repository.findByLogin(request.login()) != null) {
            throw new BusinessRuleException("Ja existe um usuario com o login " + request.login() + ".");
        }

        AccessProfile profile = requireProfile(request.profileId());

        User user = new User(
                request.login(),
                request.name(),
                request.email(),
                passwordEncoder.encode(request.password()),
                profile
        );

        return UserResponseDTO.from(repository.save(user));
    }

    @Transactional
    public UserResponseDTO update(UUID userId, UserUpdateDTO request) {
        User user = requireUser(userId);
        AccessProfile profile = requireProfile(request.profileId());

        // Trocar o proprio perfil e como serrar o galho em que se esta sentado: a
        // pessoa poderia se rebaixar por engano e perder o acesso a esta tela.
        if (isCurrentUser(user)) {
            throw new BusinessRuleException(
                    "Voce nao pode alterar o proprio perfil de acesso. Peca a outro administrador.");
        }

        boolean losesAdmin = grantsUserManagement(user.getProfile()) && !grantsUserManagement(profile);
        if (losesAdmin) {
            requireAnotherActiveAdmin(user);
        }

        user.setName(request.name());
        user.setEmail(request.email());
        user.setProfile(profile);

        return UserResponseDTO.from(repository.save(user));
    }

    /**
     * Desativa em vez de excluir: o historico de quem movimentou estoque, criou
     * pedido ou lancou nota precisa continuar rastreavel.
     */
    @Transactional
    public UserResponseDTO setActive(UUID userId, boolean active) {
        User user = requireUser(userId);

        if (isCurrentUser(user) && !active) {
            throw new BusinessRuleException("Voce nao pode desativar o proprio usuario.");
        }

        if (!active && grantsUserManagement(user.getProfile())) {
            requireAnotherActiveAdmin(user);
        }

        user.setActive(active);
        return UserResponseDTO.from(repository.save(user));
    }

    @Transactional
    public void changePassword(UUID userId, PasswordChangeDTO request) {
        User user = requireUser(userId);
        user.setPassword(passwordEncoder.encode(request.password()));
        repository.save(user);
    }

    /** Perfil e alcance do usuario autenticado, para o frontend montar a navegacao. */
    public MeResponseDTO currentUserAccess() {
        User user = accessGuard.currentUser();
        if (user == null) {
            throw new BusinessRuleException("Nenhum usuario autenticado.");
        }

        List<OperationalUnit> units = unitRepository.findAll();
        List<MeResponseDTO.ModuleAccessDTO> modules = new ArrayList<>();

        for (AccessModule module : AccessModule.values()) {
            List<MeResponseDTO.UnitAccessDTO> unitAccess = new ArrayList<>();
            AccessLevel highest = AccessLevel.NONE;

            for (OperationalUnit unit : units) {
                AccessLevel level = user.levelFor(module, unit.getId());
                unitAccess.add(new MeResponseDTO.UnitAccessDTO(unit.getId(), unit.getName(), level.name()));
                if (level.allows(highest)) {
                    highest = level;
                }
            }

            modules.add(new MeResponseDTO.ModuleAccessDTO(module.name(), highest.name(), unitAccess));
        }

        return new MeResponseDTO(
                user.getId(),
                user.getLogin(),
                user.getName(),
                user.getEmail(),
                user.getProfile() == null ? null : user.getProfile().getName(),
                modules
        );
    }

    private boolean grantsUserManagement(AccessProfile profile) {
        return profile != null
                && profile.levelFor(AccessModule.USER_MANAGEMENT, null).allows(AccessLevel.OPERATE);
    }

    /**
     * Precisa sobrar pelo menos um administrador ativo alem deste. Sem isso o
     * sistema fica sem ninguem capaz de criar usuario ou devolver acesso.
     */
    private void requireAnotherActiveAdmin(User excluded) {
        boolean anotherExists = repository.findAll().stream()
                .anyMatch(u -> u.isActive()
                        && !u.getId().equals(excluded.getId())
                        && grantsUserManagement(u.getProfile()));

        if (!anotherExists) {
            throw new BusinessRuleException(
                    "Este e o unico administrador ativo. De o perfil de administrador a outra pessoa antes.");
        }
    }

    private boolean isCurrentUser(User user) {
        User current = accessGuard.currentUser();
        return current != null && current.getId().equals(user.getId());
    }

    private User requireUser(UUID userId) {
        return repository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", userId));
    }

    private AccessProfile requireProfile(UUID profileId) {
        return profileRepository.findById(profileId)
                .orElseThrow(() -> new ResourceNotFoundException("Perfil de acesso", profileId));
    }
}
