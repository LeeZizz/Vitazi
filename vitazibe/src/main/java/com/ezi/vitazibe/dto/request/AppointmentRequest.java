package com.ezi.vitazibe.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentRequest {
    private String clinicId;
    private String departmentId;
    private String scheduleId;
    private String userName;
    private String userPhone;
    private String userEmail;
    private String description;
    private LocalDate appointmentDate;
}
