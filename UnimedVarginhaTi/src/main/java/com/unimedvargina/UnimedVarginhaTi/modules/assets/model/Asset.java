package com.unimedvargina.UnimedVarginhaTi.modules.assets.model;

import com.unimedvargina.UnimedVarginhaTi.shared.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "assets")
@Getter @Setter @NoArgsConstructor
public class Asset extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String assetTag;

    private String description;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private AssetStatus status;

}
