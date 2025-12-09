package com.ezi.vitazibe.services;

import com.ezi.vitazibe.dto.request.DepartmentRequest;
import com.ezi.vitazibe.dto.response.DepartmentResponse;
import com.ezi.vitazibe.entities.ClinicEntity;
import com.ezi.vitazibe.entities.DepartmentEntity;
import com.ezi.vitazibe.enums.ClinicType;
import com.ezi.vitazibe.exceptions.ErrorCode;
import com.ezi.vitazibe.exceptions.WebException;
import com.ezi.vitazibe.repositories.ClinicRepository;
import com.ezi.vitazibe.repositories.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DepartmentService {
    private final DepartmentRepository departmentRepository;

    private final ClinicRepository clinicRepository;

    private void validateDepartmentRequest(ClinicEntity clinic) {
        if(clinic.getClinicType() != ClinicType.GENERAL){
            throw new WebException(ErrorCode.CLINIC_NOT_GENERAL);
        }
    }

    @Transactional
    public DepartmentEntity createDepartment(DepartmentRequest departmentRequest) {
        ClinicEntity clinicEntity = clinicRepository.findById(departmentRequest.getClinicId())
                .orElseThrow(() -> new WebException(ErrorCode.CLINIC_NOT_FOUND));
        validateDepartmentRequest(clinicEntity);
        DepartmentEntity departmentEntity = new DepartmentEntity();
        departmentEntity.setClinicId(clinicEntity);
        departmentEntity.setDepartmentName(departmentRequest.getDepartmentName());
        departmentEntity.setDesciption(departmentRequest.getDescription());
        return departmentRepository.save(departmentEntity);
    }

    @Transactional
    public List<DepartmentResponse> getListDepartmentsByClinicId(String clinicId) {
        ClinicEntity clinic = clinicRepository.findById(clinicId)
                .orElseThrow(() -> new WebException(ErrorCode.CLINIC_NOT_FOUND));
       // validateDepartmentRequest(clinic);
        return departmentRepository.findByClinicIdId(clinicId).stream()
                .map(dept -> {
                    DepartmentResponse response = new DepartmentResponse();
                    response.setId(dept.getId());
                    response.setDepartmentName(dept.getDepartmentName());
                    response.setDescription(dept.getDesciption());
                    response.setClinicId(dept.getClinicId().getId());
                    response.setClinicName(dept.getClinicId().getClinicName());
                    return response;
                })
                .toList();
    }

    @Transactional
    public DepartmentResponse updateDepartment(String departmentId, DepartmentRequest departmentRequest){
        DepartmentEntity departmentEntity = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new WebException(ErrorCode.DEPARTMENT_NOT_FOUND));
        validateDepartmentRequest(departmentEntity.getClinicId());
        if(departmentRequest.getClinicId() != null){
            ClinicEntity clinicEntity = clinicRepository.findById(departmentRequest.getClinicId())
                    .orElseThrow(() -> new WebException(ErrorCode.CLINIC_NOT_FOUND));
            departmentEntity.setClinicId(clinicEntity);
        }
        if(departmentRequest.getDepartmentName() != null){
            departmentEntity.setDepartmentName(departmentRequest.getDepartmentName());
        }
        if(departmentRequest.getDescription() != null){
            departmentEntity.setDesciption(departmentRequest.getDescription());
        }
        DepartmentEntity saved = departmentRepository.save(departmentEntity);

        DepartmentResponse response = new DepartmentResponse();
        response.setId(saved.getId());
        response.setDepartmentName(saved.getDepartmentName());
        response.setDescription(saved.getDesciption());
        response.setClinicId(saved.getClinicId().getId());
        response.setClinicName(saved.getClinicId().getClinicName());
        return response;
    }

    @Transactional
    public void deleteDepartment(String departmentId){
        DepartmentEntity departmentEntity = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new WebException(ErrorCode.DEPARTMENT_NOT_FOUND));
        validateDepartmentRequest(departmentEntity.getClinicId());
        departmentRepository.delete(departmentEntity);
    }
}
