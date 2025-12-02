package com.ezi.vitazibe.services;

import com.ezi.vitazibe.dto.request.ScheduleRequest;
import com.ezi.vitazibe.dto.response.ScheduleResponse;
import com.ezi.vitazibe.entities.ClinicEntity;
import com.ezi.vitazibe.entities.DepartmentEntity;
import com.ezi.vitazibe.entities.ScheduleEntity;
import com.ezi.vitazibe.exceptions.ErrorCode;
import com.ezi.vitazibe.exceptions.WebException;
import com.ezi.vitazibe.repositories.ClinicRepository;
import com.ezi.vitazibe.repositories.DepartmentRepository;
import com.ezi.vitazibe.repositories.ScheduleRespository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ScheduleService {

    private final ScheduleRespository scheduleRespository;
    private final ClinicRepository clinicRepository;
    private final DepartmentRepository departmentRepository;

    @Transactional
    public ScheduleResponse createSchedule(ScheduleRequest scheduleRequest){
        ClinicEntity clinicEntity = clinicRepository.findById(scheduleRequest.getClinicId())
                .orElseThrow(() -> new WebException(ErrorCode.CLINIC_NOT_FOUND));
        DepartmentEntity departmentEntity = departmentRepository.findById(scheduleRequest.getDepartmentId())
                .orElseThrow(() -> new WebException(ErrorCode.DEPARTMENT_NOT_FOUND));
        ScheduleEntity scheduleEntity = new ScheduleEntity();
        scheduleEntity.setClinicId(clinicEntity);
        scheduleEntity.setDepartmentId(departmentEntity);
        scheduleEntity.setCapacity(scheduleRequest.getCapacity());
        scheduleEntity.setMaxCapacity(scheduleRequest.getMaxCapacity());
        scheduleEntity.setIsActive(true);
        scheduleEntity.setStartTime(scheduleRequest.getStartTime());
        scheduleEntity.setEndTime(scheduleRequest.getEndTime());
        scheduleEntity.setDate(scheduleRequest.getDate());

        ScheduleEntity savedSchedule = scheduleRespository.save(scheduleEntity);
        return mapToResponse(savedSchedule);
    }

    @Transactional
    public List<ScheduleResponse> getListSchedule(String ClinicId, String DepartmentId){
        List<ScheduleEntity> schedule;
//        if(ClinicId != null && DepartmentId != null){
//            schedule = scheduleRespository.findByClinicIdAndDepartmentId(ClinicId, DepartmentId);
//        } else if(ClinicId != null){
//            schedule = scheduleRespository.findByClinicId(ClinicId);
//        } else if(DepartmentId != null){
//            schedule = scheduleRespository.findByDepartmentId(DepartmentId);
//        } else {
//            schedule = scheduleRespository.findAll();
//        }
        schedule = scheduleRespository.findByClinicId_IdAndDepartmentId_Id(ClinicId, DepartmentId);
        return schedule.stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional
    public ScheduleResponse updateSchedule(String id, ScheduleRequest request){
        ScheduleEntity scheduleEntity = scheduleRespository.findById(id)
                .orElseThrow(() -> new WebException(ErrorCode.SCHEDULE_NOT_FOUND));
        if (request.getClinicId() != null) {
            ClinicEntity clinic = clinicRepository.findById(request.getClinicId())
                    .orElseThrow(() -> new WebException(ErrorCode.CLINIC_NOT_FOUND));
            scheduleEntity.setClinicId(clinic);
        }

        if (request.getDepartmentId() != null) {
            DepartmentEntity department = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new WebException(ErrorCode.DEPARTMENT_NOT_FOUND));
            scheduleEntity.setDepartmentId(department);
        }
        scheduleEntity.setCapacity(request.getCapacity());
        scheduleEntity.setMaxCapacity(request.getMaxCapacity());
        scheduleEntity.setIsActive(request.getIsActive());
        scheduleEntity.setStartTime(request.getStartTime());
        scheduleEntity.setEndTime(request.getEndTime());
        scheduleEntity.setDate(request.getDate());

        ScheduleEntity updatedSchedule = scheduleRespository.save(scheduleEntity);
        return mapToResponse(updatedSchedule);
    }

    @Transactional
    public void deleteSchedule(String id){
        if(!scheduleRespository.existsById(id)){
            throw new WebException(ErrorCode.SCHEDULE_NOT_FOUND);
        }
        scheduleRespository.deleteById(id);
    }

    private ScheduleResponse mapToResponse(ScheduleEntity entity){
        return new ScheduleResponse(
                entity.getId(),
                entity.getClinicId() != null ? entity.getClinicId().getId() : null,
                entity.getDepartmentId() != null ? entity.getDepartmentId().getId() : null,
                entity.getCapacity(),
                entity.getMaxCapacity(),
                entity.getIsActive(),
                entity.getStartTime(),
                entity.getEndTime(),
                entity.getDate(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }
}
