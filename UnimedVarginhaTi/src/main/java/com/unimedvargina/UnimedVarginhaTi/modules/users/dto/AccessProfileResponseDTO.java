package com.unimedvargina.UnimedVarginhaTi.modules.users.dto;

import com.unimedvargina.UnimedVarginhaTi.modules.users.model.AccessProfile;

import java.util.UUID;

public record AccessProfileResponseDTO(UUID id, String name, String description) {

    public static AccessProfileResponseDTO from(AccessProfile profile) {
        return new AccessProfileResponseDTO(profile.getId(), profile.getName(), profile.getDescription());
    }
}
