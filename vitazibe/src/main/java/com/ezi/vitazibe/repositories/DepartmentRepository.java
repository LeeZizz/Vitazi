package com.ezi.vitazibe.repositories;

import com.ezi.vitazibe.entities.DepartmentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DepartmentRepository extends JpaRepository<DepartmentEntity, String> {
    Optional<DepartmentEntity> findByDepartmentName(String departmentName);
    List<DepartmentEntity> findByClinicIdId(String clinicId);
}
