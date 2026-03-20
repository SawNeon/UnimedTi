package com.unimedvargina.UnimedVarginhaTi.modules.users.repository;

import com.unimedvargina.UnimedVarginhaTi.modules.users.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

    UserDetails findByLogin(String login);

}