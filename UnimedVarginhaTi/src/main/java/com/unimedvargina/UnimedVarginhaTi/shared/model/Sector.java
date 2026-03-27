package com.unimedvargina.UnimedVarginhaTi.shared;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "sectors")
@Getter @Setter
public class Sector {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    public Sector() {}

    public Sector(String name) {
        this.name = name;
    }
}
