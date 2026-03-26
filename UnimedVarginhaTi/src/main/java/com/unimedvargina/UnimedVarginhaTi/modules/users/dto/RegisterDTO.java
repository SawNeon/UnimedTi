package com.unimedvargina.UnimedVarginhaTi.modules.users.dto;
import com.unimedvargina.UnimedVarginhaTi.modules.users.model.UserRole;

public record RegisterDTO(String login, String password, UserRole role, String name, String email) {
}