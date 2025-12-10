package com.ezi.vitazibe.services;

import com.ezi.vitazibe.dto.response.NotificationResponse;
import com.ezi.vitazibe.entities.AppointmentEntity;
import com.ezi.vitazibe.entities.NotificationEntity;
import com.ezi.vitazibe.enums.Status;
import com.ezi.vitazibe.exceptions.ErrorCode;
import com.ezi.vitazibe.exceptions.WebException;
import com.ezi.vitazibe.repositories.AppointmentRepository;
import com.ezi.vitazibe.repositories.NotificationRespository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private final NotificationRespository notificationRespository;
    private final AppointmentRepository appointmentRepository;

    public Page<NotificationResponse> getNotificationsByClinicId(String clinicId, Status status, Pageable pageable) {
        Page<NotificationEntity> notifications;
        if (status != null) {
            notifications = notificationRespository.findByClinicId_IdAndStatus(clinicId, status, pageable);
        } else {
            notifications = notificationRespository.findByClinicId_Id(clinicId, pageable);
        }
        return notifications.map(this::mapToResponse);
    }

    @Transactional
    public NotificationResponse updateNotificationStatus(String notificationId, Status status) {
        NotificationEntity notification = notificationRespository.findById(notificationId)
                .orElseThrow(() -> new WebException(ErrorCode.NOTIFICATION_NOT_FOUND));
        notification.setStatus(status);
        NotificationEntity updatedNotification = notificationRespository.save(notification);
        if (notification.getAppointmentId() != null){
            AppointmentEntity appointment = notification.getAppointmentId();
            appointment.setStatus(status);
            appointmentRepository.save(appointment);
        }
        return  mapToResponse(updatedNotification);
    }

    public Map<String, Long> getNotificationCountsByStatus(String clinicId){
        Map<String, Long> counts = new HashMap<>();
        counts.put("PENDING", notificationRespository.countByClinicId_IdAndStatus(clinicId, Status.PENDING));
        counts.put("CONFIRMED", notificationRespository.countByClinicId_IdAndStatus(clinicId, Status.CONFIRMED));
        counts.put("CANCELED", notificationRespository.countByClinicId_IdAndStatus(clinicId, Status.CANCELED));
        return counts;
    }

    @Transactional
    public void markAsProcessed(String apointmentId) {
        List<NotificationEntity> notifications = notificationRespository.findByClinicId_IdAndStatusOrderByCreatedAtDesc(apointmentId, Status.PENDING);
        notifications.forEach(n -> {
            n.setStatus(Status.CONFIRMED);
            notificationRespository.save(n);
        });
    }


    private NotificationResponse mapToResponse(NotificationEntity entity) {
        return NotificationResponse.builder()
                .id(entity.getId())
                .clinicId(entity.getClinicId().getId())
                .userEmail(entity.getUserEmail())
                .title(entity.getTitle())
                .message(entity.getMessage())
                .status(entity.getStatus())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
