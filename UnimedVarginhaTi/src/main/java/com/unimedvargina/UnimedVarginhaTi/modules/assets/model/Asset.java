package com.unimedvargina.UnimedVarginhaTi.modules.assets.model;

import com.unimedvargina.UnimedVarginhaTi.shared.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "assets")
@Getter @Setter @NoArgsConstructor
public class Assets extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Column(nullable = false )
    private String property;

    private String description;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private StatusAssets  status;

}
