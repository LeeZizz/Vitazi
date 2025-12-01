package com.ezi.vitazibe.entities;


import com.ezi.vitazibe.enums.ClinicType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "clinics")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClinicEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String oauthProvider;
    @Column(nullable = false, length = 100)

    private String oauthEmail;
    private String clinicName;

    @Column(nullable = false, unique = true)
    private String oauthSub;

    @Enumerated(EnumType.STRING)
    private ClinicType clinicType;

    private LocalDate createdAt;
    private LocalDate updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDate.now();
        this.updatedAt = LocalDate.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDate.now();
    }

}
