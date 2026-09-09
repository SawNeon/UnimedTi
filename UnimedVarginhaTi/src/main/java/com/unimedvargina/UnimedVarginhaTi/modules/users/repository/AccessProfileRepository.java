package com.unimedvargina.UnimedVarginhaTi.modules.users.repository;

import com.unimedvargina.UnimedVarginhaTi.modules.users.model.AccessProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface AccessProfileRepository extends JpaRepository<AccessProfile, UUID> {
}
