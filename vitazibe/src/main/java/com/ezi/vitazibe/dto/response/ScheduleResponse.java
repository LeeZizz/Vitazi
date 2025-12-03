package com.ezi.vitazibe.dto.response;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ScheduleResponse {
    private String id;
    private String clinicId;
    private String departmentId;
    private int capacity;
    private int maxCapacity;
    private Boolean isActive;
    private LocalTime startTime;
    private LocalTime endTime;
    private LocalDate date;
    private LocalDate createdAt;
    private LocalDate updatedAt;
}
