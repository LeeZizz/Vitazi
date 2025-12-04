package com.ezi.vitazibe.services;

import com.ezi.vitazibe.dto.request.AppointmentRequest;
import com.ezi.vitazibe.dto.response.AppointmentResponse;
import com.ezi.vitazibe.entities.*;
import com.ezi.vitazibe.enums.Status;
import com.ezi.vitazibe.exceptions.ErrorCode;
import com.ezi.vitazibe.exceptions.WebException;
import com.ezi.vitazibe.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AppointmentService {
    private final AppointmentRepository appointmentRepository;
    private final ClinicRepository clinicRepository;
    private final DepartmentRepository departmentRepository;
    private final ScheduleRespository scheduleRespository;
    private final NotificationRespository notificationRespository;

    @Transactional
    public AppointmentResponse createAppointment(AppointmentRequest appointmentRequest) {
        ClinicEntity clinicEntity = clinicRepository.findById(appointmentRequest.getClinicId())
                .orElseThrow(() -> new WebException(ErrorCode.CLINIC_NOT_FOUND));
        DepartmentEntity departmentEntity = departmentRepository.findById(appointmentRequest.getDepartmentId())
                .orElseThrow(() -> new WebException(ErrorCode.DEPARTMENT_NOT_FOUND));
        ScheduleEntity scheduleEntity = scheduleRespository.findById(appointmentRequest.getScheduleId())
                .orElseThrow(() -> new WebException(ErrorCode.SCHEDULE_NOT_FOUND));

        if (scheduleEntity.getCapacity() >= scheduleEntity.getMaxCapacity()) {
            scheduleEntity.setIsActive(false);
            scheduleRespository.save(scheduleEntity);
            throw new WebException(ErrorCode.SCHEDULE_FULL);
        }
        scheduleEntity.setCapacity(scheduleEntity.getCapacity() + 1);
        scheduleRespository.save(scheduleEntity);

        AppointmentEntity appointmentEntity = new AppointmentEntity();
        appointmentEntity.setClinicId(clinicEntity);
        appointmentEntity.setDepartmentId(departmentEntity);
        appointmentEntity.setScheduleId(scheduleEntity);

        appointmentEntity.setUserName(appointmentRequest.getUserName());
        appointmentEntity.setUserPhone(appointmentRequest.getUserPhone());
        appointmentEntity.setUserEmail(appointmentRequest.getUserEmail());
        appointmentEntity.setDescription(appointmentRequest.getDescription());
        appointmentEntity.setStatus(Status.PENDING);
        appointmentEntity.setNotificationSent(false);
        appointmentEntity.setAppointmentDate(appointmentRequest.getAppointmentDate());

        AppointmentEntity savedAppointment = appointmentRepository.save(appointmentEntity);

        NotificationEntity notification = new NotificationEntity();
        notification.setClinicId(clinicEntity);
        notification.setAppointmentId(savedAppointment);
        notification.setUserEmail(appointmentRequest.getUserEmail());
        notification.setTitle("Yêu cầu đặt lịch khám mới");
        notification.setMessage(String.format(
                "Có yêu cầu đặt lịch từ %s - SĐT: %s tại khoa %s - Ca khám: %s đến %s",
                appointmentRequest.getUserName(),
                appointmentRequest.getUserPhone(),
                departmentEntity.getDepartmentName(),
                scheduleEntity.getStartTime(),
                scheduleEntity.getEndTime()
        ));
        notification.setStatus(Status.PENDING);
        notificationRespository.save(notification);

        return mapToResponse(savedAppointment);
    }

    public List<AppointmentResponse> getAppointmentByClinicId(String clinicId, Status status) {
        List<AppointmentEntity> appointments;
        if (status != null) {
            appointments = appointmentRepository.findByClinicId_IdAndStatus(clinicId, status);
        } else {
            appointments = appointmentRepository.findByClinicId_IdOrderByCreatedAtDesc(clinicId);
        }
        return appointments.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public AppointmentResponse getAppointmentDetails(String appointmentId) {
        AppointmentEntity appointmentEntity = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new WebException(ErrorCode.APPOINTMENT_NOT_FOUND));
        return mapToResponse(appointmentEntity);
    }

    @Transactional
    public AppointmentResponse updateAppointmentStatus(String appointmentId, Status newStatus) {
        AppointmentEntity appointmentEntity = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new WebException(ErrorCode.APPOINTMENT_NOT_FOUND));
        appointmentEntity.setStatus(newStatus);
        AppointmentEntity updatedAppointment = appointmentRepository.save(appointmentEntity);
        return mapToResponse(updatedAppointment);
    }



    private AppointmentResponse mapToResponse(AppointmentEntity entity) {
        return AppointmentResponse.builder()
                .id(entity.getId())
                .clinicId(entity.getClinicId().getId())
                .clinicName(entity.getClinicId().getClinicName())
                .departmentId(entity.getDepartmentId().getId())
                .scheduleId(entity.getScheduleId().getId())
                .startTime(entity.getScheduleId().getStartTime())
                .endTime(entity.getScheduleId().getEndTime())
                .departmentName(entity.getDepartmentId().getDepartmentName())
                .userName(entity.getUserName())
                .userPhone(entity.getUserPhone())
                .userEmail(entity.getUserEmail())
                .description(entity.getDescription())
                .status(entity.getStatus())
                .appointmentDate(entity.getAppointmentDate())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
