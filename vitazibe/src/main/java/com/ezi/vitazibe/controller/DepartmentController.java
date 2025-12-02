package com.ezi.vitazibe.controller;

import com.ezi.vitazibe.dto.request.DepartmentRequest;
import com.ezi.vitazibe.dto.response.ApiResponse;
import com.ezi.vitazibe.dto.response.DepartmentResponse;
import com.ezi.vitazibe.entities.DepartmentEntity;
import com.ezi.vitazibe.services.DepartmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequiredArgsConstructor
@RequestMapping("/departments")
@RestController
public class DepartmentController {
    private final DepartmentService departmentService;

    @PostMapping("/createDepartment")
    public ResponseEntity<ApiResponse<DepartmentEntity>> createDepartment(@RequestBody DepartmentRequest departmentRequest) {
        DepartmentEntity createdDepartment = departmentService.createDepartment(departmentRequest);
        ApiResponse<DepartmentEntity> response = ApiResponse.<DepartmentEntity>builder()
                .message("Department created successfully")
                .result(createdDepartment)
                .build();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/getListDepartments/{clinicId}")
    public ResponseEntity<ApiResponse<List<DepartmentResponse>>> getListDepartments(@PathVariable String clinicId) {
        List<DepartmentResponse> departments = departmentService.getListDepartmentsByClinicId(clinicId);
        ApiResponse<List<DepartmentResponse>> response = ApiResponse.<List<DepartmentResponse>>builder()
                .message("Departments retrieved successfully")
                .result(departments)
                .build();
        return ResponseEntity.ok(response);
    }

    @PutMapping("/updateDepartment/{departmentId}")
    public ResponseEntity<ApiResponse<DepartmentResponse>> updateDepartment(@PathVariable String departmentId, @RequestBody DepartmentRequest departmentRequest){
        DepartmentResponse updatedDepartment = departmentService.updateDepartment(departmentId, departmentRequest);
        ApiResponse<DepartmentResponse> response = ApiResponse.<DepartmentResponse>builder()
                .message("Department updated successfully")
                .result(updatedDepartment)
                .build();
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/deleteDepartment/{departmentId}")
    public ResponseEntity<ApiResponse<Void>> deleteDepartment(@PathVariable String departmentId) {
        departmentService.deleteDepartment(departmentId);
        ApiResponse<Void> response = ApiResponse.<Void>builder()
                .message("Department deleted successfully")
                .build();
        return ResponseEntity.ok(response);
    }
}
