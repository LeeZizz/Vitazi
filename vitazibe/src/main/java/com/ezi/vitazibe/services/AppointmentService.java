package com.ezi.vitazibe.services;

import com.ezi.vitazibe.dto.request.AppointmentRequest;
import com.ezi.vitazibe.dto.response.AppointmentResponse;
import com.ezi.vitazibe.dto.response.MonthlyCountResponse;
import com.ezi.vitazibe.dto.request.UpdateAppointmentDetailsRequest;
import com.ezi.vitazibe.entities.*;
import com.ezi.vitazibe.enums.Status;
import com.ezi.vitazibe.exceptions.ErrorCode;
import com.ezi.vitazibe.exceptions.WebException;
import com.ezi.vitazibe.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.query.JpaEntityGraph;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

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
                "Có yêu cầu đặt lịch từ %s - SĐT: %s tại khoa %s - Ca khám: %s đến %s - Dấu hiệu: %s",
                appointmentRequest.getUserName(),
                appointmentRequest.getUserPhone(),
                departmentEntity.getDepartmentName(),
                scheduleEntity.getStartTime(),
                scheduleEntity.getEndTime(),
                appointmentRequest.getDescription()
        ));
        notification.setStatus(Status.PENDING);
        notificationRespository.save(notification);

        return mapToResponse(savedAppointment);
    }

    public Page<AppointmentResponse> getAppointmentByClinicId(String clinicId, Status status, Pageable pageable) {
        Page<AppointmentEntity> appointments;
        if (status != null) {
            appointments = appointmentRepository.findByClinicId_IdAndStatus(clinicId, status, pageable);
        } else {
            appointments = appointmentRepository.findByClinicId_IdOrderByCreatedAtDesc(clinicId, pageable);
        }
        return appointments.map(this::mapToResponse);
    }

    public AppointmentResponse getAppointmentDetails(String appointmentId) {
        AppointmentEntity appointmentEntity = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new WebException(ErrorCode.APPOINTMENT_NOT_FOUND));
        return mapToResponse(appointmentEntity);
    }

//    @Transactional
//    public AppointmentResponse updateAppointmentStatus(String appointmentId, Status newStatus) {
//        AppointmentEntity appointmentEntity = appointmentRepository.findById(appointmentId)
//                .orElseThrow(() -> new WebException(ErrorCode.APPOINTMENT_NOT_FOUND));
//        appointmentEntity.setStatus(newStatus);
//        AppointmentEntity updatedAppointment = appointmentRepository.save(appointmentEntity);
//        return mapToResponse(updatedAppointment);
//    }

//    public Map<Integer, Long> getMonthlyAppointmentCounts(String clinicId, int year) {
//        List<MonthlyCountResponse> counts = appointmentRepository.countAppointmentsByMonth(clinicId, year);
//        Map<Integer, Long> countsMap = counts.stream()
//                .collect(Collectors.toMap(MonthlyCountResponse::getMonth, MonthlyCountResponse::getCount));
//
//        return IntStream.rangeClosed(1, 12).boxed()
//                .collect(Collectors.toMap(Function.identity(), month -> countsMap.getOrDefault(month, 0L)));
//    }


    public Long countAppointmentsForCurrentMonthToDate(String clinicId) {
        LocalDate today = LocalDate.now();
        LocalDate firstDayOfMonth = today.with(TemporalAdjusters.firstDayOfMonth());
        return appointmentRepository.countAppointmentsBetweenDates(clinicId, firstDayOfMonth, today);
    }

    @Transactional
    public AppointmentResponse updateAppointmentStatus(String appointmentId, Status newStatus) {
        AppointmentEntity appointmentEntity = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new WebException(ErrorCode.APPOINTMENT_NOT_FOUND));

        Status oldStatus = appointmentEntity.getStatus();
        if (oldStatus != newStatus) {
            ScheduleEntity scheduleEntity = appointmentEntity.getScheduleId();
            if (scheduleEntity != null) {
                if (newStatus == Status.CANCELED) {
                    int newCapacity = Math.max(0, scheduleEntity.getCapacity() - 1);
                    scheduleEntity.setCapacity(newCapacity);
                    if (!scheduleEntity.getIsActive() && newCapacity < scheduleEntity.getMaxCapacity()) {
                        scheduleEntity.setIsActive(true);
                    }
                } else if (oldStatus == Status.CANCELED && (newStatus == Status.CONFIRMED || newStatus == Status.PENDING)) {
                    if (scheduleEntity.getCapacity() >= scheduleEntity.getMaxCapacity()) {
                        throw new WebException(ErrorCode.SCHEDULE_FULL);
                    }
                    int newCapacity = scheduleEntity.getCapacity() + 1;
                    scheduleEntity.setCapacity(newCapacity);
                    if (newCapacity >= scheduleEntity.getMaxCapacity()) {
                        scheduleEntity.setIsActive(false);
                    }
                }
                scheduleRespository.save(scheduleEntity);
            }
            appointmentEntity.setStatus(newStatus);
        }

        AppointmentEntity updatedAppointment = appointmentRepository.save(appointmentEntity);
        return mapToResponse(updatedAppointment);
    }


    @Transactional
    public AppointmentResponse updateAppointmentDetails(String appointmentId, UpdateAppointmentDetailsRequest request) {
        AppointmentEntity appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new WebException(ErrorCode.APPOINTMENT_NOT_FOUND));

        ScheduleEntity oldSchedule = appointment.getScheduleId();
        ScheduleEntity newSchedule = scheduleRespository.findById(request.getScheduleId())
                .orElseThrow(() -> new WebException(ErrorCode.SCHEDULE_NOT_FOUND));

        // Chỉ xử lý khi ca khám thực sự thay đổi
        if (!Objects.equals(oldSchedule.getId(), newSchedule.getId())) {
            // Chỉ điều chỉnh capacity cho các cuộc hẹn chưa bị hủy
            if (appointment.getStatus() != Status.CANCELED) {
                // 1. Kiểm tra sức chứa của ca khám mới
                if (newSchedule.getCapacity() >= newSchedule.getMaxCapacity()) {
                    throw new WebException(ErrorCode.SCHEDULE_FULL);
                }

                // 2. Giảm capacity của ca cũ
                int oldCapacity = Math.max(0, oldSchedule.getCapacity() - 1);
                oldSchedule.setCapacity(oldCapacity);
                if (!oldSchedule.getIsActive() && oldCapacity < oldSchedule.getMaxCapacity()) {
                    oldSchedule.setIsActive(true); // Kích hoạt lại nếu ca cũ đã đầy
                }
                // 3. Tăng capacity của ca mới
                int newCapacity = newSchedule.getCapacity() + 1;
                newSchedule.setCapacity(newCapacity);
                if (newCapacity >= newSchedule.getMaxCapacity()) {
                    newSchedule.setIsActive(false); // Vô hiệu hóa nếu ca mới đầy
                }
                scheduleRespository.save(newSchedule);
            }
        }

        // Cập nhật thông tin cho cuộc hẹn
        appointment.setScheduleId(newSchedule);
        appointment.setAppointmentDate(request.getAppointmentDate());

        AppointmentEntity updatedAppointment = appointmentRepository.save(appointment);
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
