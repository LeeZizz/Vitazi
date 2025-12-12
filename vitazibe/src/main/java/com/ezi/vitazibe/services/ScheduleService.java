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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ScheduleService {

    private final ScheduleRespository scheduleRespository;
    private final ClinicRepository clinicRepository;
    private final DepartmentRepository departmentRepository;

    @Transactional
    public ScheduleResponse createSchedule(ScheduleRequest scheduleRequest){
        if (scheduleRequest.getDate() == null || !scheduleRequest.getDate().isAfter(LocalDate.now())) {
            throw new WebException(ErrorCode.INVALID_SCHEDULE_DATE);
        }
        List<ScheduleEntity> existingSchedules = scheduleRespository.findByClinicId_IdAndDepartmentId_IdAndDateAndIsActive(
                scheduleRequest.getClinicId(),
                scheduleRequest.getDepartmentId(),
                scheduleRequest.getDate(),
                true
        );
        LocalTime newStart = scheduleRequest.getStartTime();
        LocalTime newEnd = scheduleRequest.getEndTime();
        for (ScheduleEntity schedule : existingSchedules) {
            LocalTime existStart = schedule.getStartTime();
            LocalTime existEnd = schedule.getEndTime();
            if (!(newEnd.isBefore(existStart) || newStart.isAfter(existEnd))) {
                throw new WebException(ErrorCode.SCHEDULE_ERROR_TIME_CONFLICT);
            }
        }
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
        schedule = scheduleRespository.findByClinicId_IdAndDepartmentId_Id(ClinicId, DepartmentId);
        return schedule.stream()
                .map(this::mapToResponse)
                .toList();
    }


    @Transactional(readOnly = true)
    public List<ScheduleResponse> getActiveSchedulesByClinicAndDepartmentAndDate(String clinicId, String departmentId, LocalDate date) {
        List<ScheduleEntity> schedules = scheduleRespository.findByClinicId_IdAndDepartmentId_IdAndDateAndIsActive(clinicId, departmentId, date, true);
        return schedules.stream()
                .map(this::mapToResponse)
                .toList();
    }

//    @Transactional
//    public Page<ScheduleResponse> getSchedulesByClinicAndDepartment(String clinicId, String departmentId, Pageable pageable) {
//        Pageable sortedByDateDesc = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), Sort.by("date").descending());
//        Page<ScheduleEntity> schedules = scheduleRespository.findByClinicId_IdAndDepartmentId_Id(clinicId, departmentId, sortedByDateDesc);
//        return schedules.map(this::mapToResponse);
//    }

    @Transactional
    public Page<ScheduleResponse> getSchedulesByClinicAndDepartment(String clinicId, String departmentId, Pageable pageable) {
        LocalDate today = LocalDate.now();
        LocalDate threeDaysLater = today.plusDays(2);

        // Sắp xếp theo ngày tăng dần, sau đó đến giờ bắt đầu tăng dần
        Pageable sortedPageable = PageRequest.of(
                pageable.getPageNumber(),
                pageable.getPageSize(),
                Sort.by("date").ascending().and(Sort.by("startTime").ascending())
        );
        Page<ScheduleEntity> schedules = scheduleRespository.findByClinicId_IdAndDepartmentId_IdAndDateBetween(
                clinicId,
                departmentId,
                today,
                threeDaysLater,
                sortedPageable
        );
        return schedules.map(this::mapToResponse);
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
//        if (request.getIsActive() != null) {
//            scheduleEntity.setIsActive(request.getIsActive());
//        }
        if (request.getIsActive() != null) {
            if (request.getIsActive() && scheduleEntity.getCapacity() >= scheduleEntity.getMaxCapacity()) {
                throw new WebException(ErrorCode.SCHEDULE_FULLY_BOOKED);
            }
            scheduleEntity.setIsActive(request.getIsActive());
        }
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
