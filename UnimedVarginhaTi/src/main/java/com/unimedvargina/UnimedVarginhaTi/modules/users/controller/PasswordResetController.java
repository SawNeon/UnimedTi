package com.unimedvargina.UnimedVarginhaTi.modules.users.controller;

import com.unimedvargina.UnimedVarginhaTi.modules.users.service.PasswordResetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class PasswordResetController {

    @Autowired
    private PasswordResetService passwordResetService;

    @PostMapping("/password-reset/request")
    public ResponseEntity<String> requestPasswordReset(@RequestBody Map<String, String> request){
        String email = request.get("email");

        if (email == null || email.isEmpty()){
            return ResponseEntity.badRequest().body("Invalid email");
        }

        passwordResetService.requestPasswordReset(email);

        return ResponseEntity.ok().body("Password Reset Successful");

    }

    @PostMapping("/password-reset/confirm")
    public ResponseEntity<String> confirmPasswordReset(@RequestBody Map<String, String> request){
        String token = request.get("token");
        String newPassword = request.get("newPassword");

        if (token == null || token.isBlank() || newPassword == null || newPassword.isBlank()) {
            return ResponseEntity.badRequest().body("Token and passoword is necessary.");
        }

        boolean success = passwordResetService.resetPassword(token, newPassword);

        if (success) {
            return ResponseEntity.ok("Password altered! You can to be login.");
        } else {
            return ResponseEntity.badRequest().body("Códe inválid.");
        }
    }
}
