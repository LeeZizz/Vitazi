package com.ezi.vitazibe.dto.response;

import com.ezi.vitazibe.enums.Status;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentResponse {
    private String id;
    private String clinicId;
    private String clinicName;
    private String departmentId;
    private String scheduleId;
    private LocalTime startTime;
    private LocalTime endTime;
    private String departmentName;
    private String userName;
    private String userPhone;
    private String userEmail;
    private String description;
    private Status status;
    private LocalDate appointmentDate;
    private LocalDate createdAt;
}
