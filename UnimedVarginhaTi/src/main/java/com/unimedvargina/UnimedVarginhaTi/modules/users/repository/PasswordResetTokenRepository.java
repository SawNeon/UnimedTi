package com.unimedvargina.UnimedVarginhaTi.modules.users.repository;

import com.unimedvargina.UnimedVarginhaTi.modules.users.entity.PasswordResetToken;
import com.unimedvargina.UnimedVarginhaTi.modules.users.model.User;
import org.springframework.data.repository.CrudRepository;

import java.util.Optional;
import java.util.UUID;

public interface PasswordResetTokenRepository extends CrudRepository<PasswordResetToken, UUID> {
    Optional<PasswordResetToken> findByToken(String token);

    Optional<PasswordResetToken> findByUser(User user);
}
