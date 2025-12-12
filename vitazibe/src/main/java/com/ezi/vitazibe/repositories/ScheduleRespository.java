package com.ezi.vitazibe.repositories;

import com.ezi.vitazibe.entities.ScheduleEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ScheduleRespository extends JpaRepository<ScheduleEntity, String> {
    List<ScheduleEntity> findByClinicId_Id(String clinicId);
    List<ScheduleEntity> findByDepartmentId_Id(String departmentId);
    List<ScheduleEntity> findByClinicId_IdAndDepartmentId_Id(String clinicId, String departmentId);
    List<ScheduleEntity> findByClinicId_IdAndDepartmentId_IdAndDateAndIsActive(String clinicId, String departmentId, LocalDate date, Boolean isActive);
    Page<ScheduleEntity> findByClinicId_IdAndDepartmentId_Id(String clinicId, String departmentId, Pageable pageable);
    Page<ScheduleEntity> findByClinicId_IdAndDepartmentId_IdAndDateBetween(String clinicId, String departmentId, LocalDate startDate, LocalDate endDate, Pageable pageable);


}
