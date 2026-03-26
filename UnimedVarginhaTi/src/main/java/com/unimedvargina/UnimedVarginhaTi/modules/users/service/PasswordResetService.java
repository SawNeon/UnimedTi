package com.unimedvargina.UnimedVarginhaTi.modules.users.service;

import com.unimedvargina.UnimedVarginhaTi.modules.users.entity.PasswordResetToken;
import com.unimedvargina.UnimedVarginhaTi.modules.users.model.User;
import com.unimedvargina.UnimedVarginhaTi.modules.users.repository.PasswordResetTokenRepository;
import com.unimedvargina.UnimedVarginhaTi.modules.users.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import java.util.UUID;

@Service
public class PasswordResetService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordResetTokenRepository tokenRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public boolean resetPassword(String token, String newPassword) {

        Optional<PasswordResetToken> tokenEntity = tokenRepository.findByToken(token);

        if (tokenEntity.isEmpty()) {
            return false;
        }

        PasswordResetToken resetToken = tokenEntity.get();

        if(Instant.now().isAfter(resetToken.getExpiryDate())){
            tokenRepository.delete(resetToken);
            return false;
        }

        User user = resetToken.getUser();

        user.setPassword(passwordEncoder.encode(newPassword));

        userRepository.save(user);

        tokenRepository.delete(resetToken);

        return true;
    }

    public void requestPasswordReset(String email) {

        UserDetails userDetails = userRepository.findByEmail(email);

        if (userDetails == null) {
            return;
        }

        SecureRandom random = new SecureRandom();
        int codigo = 100000 + random.nextInt(900000);
        String token = String.valueOf(codigo);
        User user = (User) userDetails;

        PasswordResetToken resetToken = tokenRepository.findByUser(user).orElse(new PasswordResetToken());

        resetToken.setToken(token);
        resetToken.setUser(user);
        resetToken.setExpiryDate(Instant.now().plus(15, ChronoUnit.MINUTES));

        tokenRepository.save(resetToken);

        String resetPassword = "Olá! Recebemos um pedido para redefinir sua senha. Seu código de segurança é: " + token;

        emailService.sendEmail(email,"Reset password",resetPassword );


    }

}
