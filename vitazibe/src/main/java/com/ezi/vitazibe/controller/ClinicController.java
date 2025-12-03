package com.ezi.vitazibe.controller;

import com.ezi.vitazibe.dto.response.ApiResponse;
import com.ezi.vitazibe.entities.ClinicEntity;
import com.ezi.vitazibe.services.ClinicService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/clinics")
@RequiredArgsConstructor
public class ClinicController {
    private final ClinicService clinicService;

    @PostMapping("/specialized")
    public ResponseEntity<ApiResponse<ClinicEntity>> createSpecializedClinic(@AuthenticationPrincipal OAuth2User oAuth2User) {
        if(oAuth2User == null) {
            ApiResponse<ClinicEntity> apiResponse = ApiResponse.<ClinicEntity>builder()
                    .message("Unauthorized")
                    .build();
            return ResponseEntity.status(401).body(apiResponse);
        }
        ClinicEntity createdClinic = clinicService.createSpecializedClinic(oAuth2User);
        ApiResponse<ClinicEntity> response = ApiResponse.<ClinicEntity>builder()
                .message("Clinic created successfully")
                .result(createdClinic)
                .build();
        return ResponseEntity.ok(response);
    }

    @PostMapping("/general")
    public ResponseEntity<ApiResponse<ClinicEntity>> createGeneralClinic(@AuthenticationPrincipal OAuth2User oAuth2User) {
        if(oAuth2User == null) {
            ApiResponse<ClinicEntity> apiResponse = ApiResponse.<ClinicEntity>builder()
                    .message("Unauthorized")
                    .build();
            return ResponseEntity.status(401).body(apiResponse);
        }
        ClinicEntity createdClinic = clinicService.createGeneralClinic(oAuth2User);
        ApiResponse<ClinicEntity> response = ApiResponse.<ClinicEntity>builder()
                .message("Clinic created successfully")
                .result(createdClinic)
                .build();
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ClinicEntity>>> getAllClinics() {
        List<ClinicEntity> clinics = clinicService.getAllClinics();
        ApiResponse<List<ClinicEntity>> response = ApiResponse.<List<ClinicEntity>>builder()
                .message("Clinics retrieved successfully")
                .result(clinics)
                .build();
        return ResponseEntity.ok(response);
    }
}
