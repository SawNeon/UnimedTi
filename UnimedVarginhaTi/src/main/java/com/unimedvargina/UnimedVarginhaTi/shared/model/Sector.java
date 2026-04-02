package com.unimedvargina.UnimedVarginhaTi.shared.model;

import com.unimedvargina.UnimedVarginhaTi.shared.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "sectors")
@Getter @Setter @NoArgsConstructor
public class Sector extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String name;
    @ManyToOne
    @JoinColumn(name = "enterprise_id")
    private Enterprise enterprise;

    @Column(nullable = false)
    private String groupName;

    @Column(nullable = false)
    private Integer costCenterCode;

}
