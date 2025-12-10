package com.ezi.vitazibe.repositories;

import com.ezi.vitazibe.entities.NotificationEntity;
import com.ezi.vitazibe.enums.Status;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRespository extends JpaRepository<NotificationEntity, String> {
    List<NotificationEntity> findByClinicId_IdAndStatusOrderByCreatedAtDesc(String clinicId, Status status);
    List<NotificationEntity> findByClinicId_IdOrderByCreatedAtDesc(String clinicId);
    Page<NotificationEntity> findByClinicId_IdAndStatus(String clinicId, Status status, Pageable pageable);
    Page<NotificationEntity> findByClinicId_Id(String clinicId, Pageable pageable);
    Long countByClinicId_IdAndStatus(String clinicId, Status status);
}
