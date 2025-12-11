package com.ezi.vitazibe.dto.request;


import lombok.Data;

import java.time.LocalDate;

@Data
public class UpdateAppointmentDetailsRequest {
    private String scheduleId;
    private LocalDate appointmentDate;
}
