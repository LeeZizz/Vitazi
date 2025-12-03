package com.ezi.vitazibe.repositories;

import com.ezi.vitazibe.entities.ScheduleEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ScheduleRespository extends JpaRepository<ScheduleEntity, String> {
    List<ScheduleEntity> findByClinicId_Id(String clinicId);
    List<ScheduleEntity> findByDepartmentId_Id(String departmentId);
    List<ScheduleEntity> findByClinicId_IdAndDepartmentId_Id(String clinicId, String departmentId);
}
