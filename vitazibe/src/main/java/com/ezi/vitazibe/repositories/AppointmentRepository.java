package com.ezi.vitazibe.repositories;

import com.ezi.vitazibe.entities.AppointmentEntity;
import com.ezi.vitazibe.enums.Status;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<AppointmentEntity, String> {
    List<AppointmentEntity> findByClinicId_IdAndStatus(String clinicId, Status status);
    List<AppointmentEntity> findByClinicId_IdOrderByCreatedAtDesc(String clinicId);
}
