package com.unimedvargina.UnimedVarginhaTi.modules.users.controller;

import com.unimedvargina.UnimedVarginhaTi.modules.users.dto.AuthenticationDTO;
import com.unimedvargina.UnimedVarginhaTi.modules.users.dto.LoginResponseDTO;
import com.unimedvargina.UnimedVarginhaTi.modules.users.model.User;
import com.unimedvargina.UnimedVarginhaTi.modules.users.service.TokenService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Autenticacao.
 *
 * <p>O cadastro de usuario saiu daqui para {@code /api/users}: criar usuario e
 * gestao de acesso, protegida por USER_MANAGEMENT, e nao parte do fluxo de login.
 *
 * <p>Usuario desativado nao passa por aqui — {@code User.isEnabled()} reflete o
 * campo {@code active}, e o Spring Security recusa a autenticacao.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private TokenService tokenService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@Valid @RequestBody AuthenticationDTO data) {

        var usernamePassword = new UsernamePasswordAuthenticationToken(data.login(), data.password());

        var auth = this.authenticationManager.authenticate(usernamePassword);

        var token = tokenService.generateToken((User) auth.getPrincipal());

        return ResponseEntity.ok(new LoginResponseDTO(token));
    }
}
