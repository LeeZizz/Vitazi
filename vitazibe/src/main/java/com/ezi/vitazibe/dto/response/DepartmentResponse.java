package com.ezi.vitazibe.dto.response;

import lombok.Data;

@Data
public class DepartmentResponse {
    private String id;
    private String clinicId;
    private String clinicName;
    private String departmentName;
    private String description;
}
