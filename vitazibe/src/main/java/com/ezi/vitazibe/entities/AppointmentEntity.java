package com.ezi.vitazibe.entities;

import com.ezi.vitazibe.enums.Status;
import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "appointments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "clinic_id", nullable = false)
    private ClinicEntity clinicId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id", nullable = false)
    private DepartmentEntity departmentId;

    private String userName;
    private String userPhone;
    private String userEmail;

    @Lob
    @Column(columnDefinition = "TEXT")
    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;

    @Enumerated(EnumType.STRING)
    private Status status;

    private Boolean notificationSent;

    private LocalDate appointmentDate;
    private LocalDate createdAt;
    private LocalDate updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDate.now();
        this.updatedAt = LocalDate.now();
        this.appointmentDate = LocalDate.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDate.now();
    }
}
