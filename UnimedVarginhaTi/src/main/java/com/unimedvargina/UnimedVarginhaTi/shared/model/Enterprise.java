package com.unimedvargina.UnimedVarginhaTi.shared.model;

import com.unimedvargina.UnimedVarginhaTi.shared.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "enterprises")
@Getter
@Setter @NoArgsConstructor
public class Enterprise extends BaseEntity {
    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false)
    private String locale;
}
