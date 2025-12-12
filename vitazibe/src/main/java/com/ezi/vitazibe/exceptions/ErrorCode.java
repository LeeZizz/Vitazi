package com.ezi.vitazibe.exceptions;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
@AllArgsConstructor
public enum ErrorCode {
    NOT_DEFINE_IN_ERROR_CODE(9999, "Unchecked error occurred", HttpStatus.INTERNAL_SERVER_ERROR),
    CLINIC_EXISTED(1001, "Clinic already exists", HttpStatus.BAD_REQUEST),
    CLINIC_NOT_FOUND(1002, "Clinic not found", HttpStatus.NOT_FOUND),
    DEPARTMENT_NOT_FOUND(1004, "Department not found", HttpStatus.NOT_FOUND),
    APPOINTMENT_NOT_FOUND(1005, "Department not found", HttpStatus.NOT_FOUND),
    CLINIC_NOT_GENERAL(1006, "Only general clinics can manage departments", HttpStatus.FORBIDDEN),
    SCHEDULE_NOT_FOUND(1007, "Schedule not found", HttpStatus.BAD_REQUEST),
    NOTIFICATION_NOT_FOUND(1008, "Schedule not found", HttpStatus.BAD_REQUEST),
    SCHEDULE_FULL(1009, "Schedule full capacity", HttpStatus.BAD_REQUEST),
    INVALID_SCHEDULE_DATE(1010, "Invalid schedule date", HttpStatus.BAD_REQUEST),
    SCHEDULE_NOT_ACTIVE(1011, "Schedule not active", HttpStatus.BAD_REQUEST),
    SCHEDULE_ERROR_TIME_CONFLICT(1011, "Start - End time conflict", HttpStatus.BAD_REQUEST),
    SCHEDULE_FULLY_BOOKED(1012, "Schedule full capacity", HttpStatus.BAD_REQUEST),
    ;

    private int code;
    private String message;
    private HttpStatusCode statusCode;
}
