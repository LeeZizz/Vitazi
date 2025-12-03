package com.ezi.vitazibe.controller;

import com.ezi.vitazibe.dto.request.AppointmentRequest;
import com.ezi.vitazibe.dto.request.UpdateStatusRequest;
import com.ezi.vitazibe.dto.response.ApiResponse;
import com.ezi.vitazibe.dto.response.AppointmentResponse;
import com.ezi.vitazibe.entities.ClinicEntity;
import com.ezi.vitazibe.enums.Status;
import com.ezi.vitazibe.exceptions.ErrorCode;
import com.ezi.vitazibe.exceptions.WebException;
import com.ezi.vitazibe.repositories.ClinicRepository;
import com.ezi.vitazibe.services.AppointmentService;
import com.ezi.vitazibe.services.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/appointments")
@RequiredArgsConstructor
public class AppointmentController {
    private final AppointmentService appointmentService;
    private final NotificationService notificationService;
    private final ClinicRepository clinicRepository;

    @PostMapping("/createAppointment")
    public ResponseEntity<ApiResponse<AppointmentResponse>> createAppointment(@RequestBody AppointmentRequest appointmentRequest){
        AppointmentResponse appointmentResponse = appointmentService.createAppointment(appointmentRequest);
        ApiResponse<AppointmentResponse> response = ApiResponse.<AppointmentResponse>builder()
                .message("Appointment created successfully")
                .result(appointmentResponse)
                .build();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/detail/{id}")
    public ResponseEntity<ApiResponse<AppointmentResponse>>getAppoinmentDetail(@PathVariable String id){
        AppointmentResponse appointmentResponse = appointmentService.getAppointmentDetails(id);
        ApiResponse<AppointmentResponse> response = ApiResponse.<AppointmentResponse>builder()
                .message("Appointment detail retrieved successfully")
                .result(appointmentResponse)
                .build();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/getAllAppointments")
    public ResponseEntity<ApiResponse<List<AppointmentResponse>>> getAllAppointments(
            @AuthenticationPrincipal OAuth2User oAuth2User,
            @RequestParam(required = false) Status status){
        String sub = oAuth2User.getAttribute("sub");
        if(sub == null) {
            sub = oAuth2User.getAttribute("id");
        }
        ClinicEntity clinic = clinicRepository.findByOauthSub(sub)
                .orElseThrow(() -> new WebException(ErrorCode.CLINIC_NOT_FOUND));
        List<AppointmentResponse> appointmentResponses = appointmentService.getAppointmentByClinicId(clinic.getId(), status);
        ApiResponse<List<AppointmentResponse>> response = ApiResponse.<List<AppointmentResponse>>builder()
                .message("Get appointments successfully")
                .result(appointmentResponses)
                .build();
        return ResponseEntity.ok(response);
    }

    @PutMapping("/updateStatus/{id}")
    public ResponseEntity<ApiResponse<AppointmentResponse>> updateAppointmentStatus(@PathVariable String id, @RequestBody UpdateStatusRequest request){
        AppointmentResponse appointmentResponse = appointmentService.updateAppointmentStatus(id, request.getStatus());
        ApiResponse<AppointmentResponse> response = ApiResponse.<AppointmentResponse>builder()
                .message("Appointment status updated successfully")
                .result(appointmentResponse)
                .build();
        return ResponseEntity.ok(response);
    }
}
