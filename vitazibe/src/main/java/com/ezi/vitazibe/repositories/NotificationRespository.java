package com.ezi.vitazibe.repositories;

import com.ezi.vitazibe.entities.NotificationEntity;
import com.ezi.vitazibe.enums.Status;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRespository extends JpaRepository<NotificationEntity, String> {
    List<NotificationEntity> findByClinicId_IdAndStatusOrderByCreatedAtDesc(String clinicId, Status status);
    List<NotificationEntity> findByClinicId_IdOrderByCreatedAtDesc(String clinicId);
    Long countByClinicId_IdAndStatus(String clinicId, Status status);
}
