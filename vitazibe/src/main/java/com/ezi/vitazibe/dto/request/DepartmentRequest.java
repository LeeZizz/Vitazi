package com.ezi.vitazibe.dto.request;

import lombok.Data;

@Data
public class DepartmentRequest {
    private String id;
    private String clinicId;
    private String departmentName;
    private String description;
}
