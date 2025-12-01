package com.ezi.vitazibe.services;

import com.ezi.vitazibe.dto.request.DepartmentRequest;
import com.ezi.vitazibe.entities.DepartmentEntity;
import com.ezi.vitazibe.repositories.ClinicRepository;
import com.ezi.vitazibe.repositories.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DepartmentService {
    private final DepartmentRepository departmentRepository;

    private final ClinicRepository clinicRepository;

    public DepartmentEntity createDepartment(DepartmentRequest departmentRequest) {
        return departmentRepository.findById(departmentRequest.getId())
                .orElseGet(() -> {
                    DepartmentEntity newDepartment = new DepartmentEntity();
                    newDepartment.setDepartmentName(departmentRequest.getId());
                    return departmentRepository.save(newDepartment);
                });
    }
}
