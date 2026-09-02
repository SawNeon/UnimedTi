package com.unimedvargina.UnimedVarginhaTi.modules.users.controller;

import com.unimedvargina.UnimedVarginhaTi.modules.users.dto.AuthenticationDTO;
import com.unimedvargina.UnimedVarginhaTi.modules.users.dto.LoginResponseDTO;
import com.unimedvargina.UnimedVarginhaTi.modules.users.dto.RegisterDTO;
import com.unimedvargina.UnimedVarginhaTi.modules.users.model.User;
import com.unimedvargina.UnimedVarginhaTi.modules.users.repository.UserRepository;
import com.unimedvargina.UnimedVarginhaTi.modules.users.service.TokenService;
import com.unimedvargina.UnimedVarginhaTi.shared.exception.BusinessRuleException;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")

public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository repository;

    @Autowired
    private TokenService tokenService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@Valid @RequestBody AuthenticationDTO data) {

        var usernamePassword = new UsernamePasswordAuthenticationToken(data.login(), data.password());

        var auth = this.authenticationManager.authenticate(usernamePassword);

        var token = tokenService.generateToken((User) auth.getPrincipal());

        return ResponseEntity.ok(new LoginResponseDTO(token));
    }

    @PostMapping("/register")
    public ResponseEntity<Void> register(@Valid @RequestBody RegisterDTO data) {

        if (this.repository.findByLogin(data.login()) != null) {
            throw new BusinessRuleException("Já existe um usuário com o login " + data.login() + ".");
        }

        String encryptedPassword = passwordEncoder.encode(data.password());

        User newUser = new User(data.login(), data.name(), data.email(), encryptedPassword, data.role());
        this.repository.save(newUser);

        return ResponseEntity.ok().build();
    }
}
