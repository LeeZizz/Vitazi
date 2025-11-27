package com.ezi.vitazibe.enums;


import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public enum ClinicType {
    GENERAL(1,"Phòng khám đa khoa"),
    SPECIALIZED(2,"Phòng khám chuyên khoa");

    private final int code;
    private final String clinicName;
}
