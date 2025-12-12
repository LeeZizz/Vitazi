package com.ezi.vitazibe.controller;

import com.ezi.vitazibe.dto.request.AppointmentRequest;
import com.ezi.vitazibe.dto.request.UpdateAppointmentDetailsRequest;
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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.time.Year;
import java.util.List;
import java.util.Map;
import java.util.Optional;

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
    public ResponseEntity<ApiResponse<Page<AppointmentResponse>>> getAllAppointments(
            @AuthenticationPrincipal OAuth2User oAuth2User,
            @RequestParam(required = false) Status status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size){
        String sub = oAuth2User.getAttribute("sub");
        if(sub == null) {
            sub = oAuth2User.getAttribute("id");
        }
        ClinicEntity clinic = clinicRepository.findByOauthSub(sub)
                .orElseThrow(() -> new WebException(ErrorCode.CLINIC_NOT_FOUND));
        Pageable pageable = PageRequest.of(page, size);
        Page<AppointmentResponse> appointmentResponses = appointmentService.getAppointmentByClinicId(clinic.getId(), status, pageable);
        ApiResponse<Page<AppointmentResponse>> response = ApiResponse.<Page<AppointmentResponse>>builder()
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

    @PutMapping("/updateSchedule/{id}")
    public ResponseEntity<ApiResponse<AppointmentResponse>> updateAppointmentDetails(
            @PathVariable String id,
            @RequestBody UpdateAppointmentDetailsRequest request) {
        AppointmentResponse appointmentResponse = appointmentService.updateAppointmentDetails(id, request);
        ApiResponse<AppointmentResponse> response = ApiResponse.<AppointmentResponse>builder()
                .message("Appointment details updated successfully")
                .result(appointmentResponse)
                .build();
        return ResponseEntity.ok(response);
    }

//    @GetMapping("/monthlyCountsInYear")
//    public ResponseEntity<ApiResponse<Map<Integer, Long>>> getMonthlyAppointmentCounts(
//            @AuthenticationPrincipal OAuth2User oAuth2User,
//            @RequestParam Optional<Integer> year) {
//        String sub = oAuth2User.getAttribute("sub");
//        if (sub == null) {
//            sub = oAuth2User.getAttribute("id");
//        }
//        ClinicEntity clinic = clinicRepository.findByOauthSub(sub)
//                .orElseThrow(() -> new WebException(ErrorCode.CLINIC_NOT_FOUND));
//
//        int targetYear = year.orElse(Year.now().getValue());
//
//        Map<Integer, Long> monthlyCounts = appointmentService.getMonthlyAppointmentCounts(clinic.getId(), targetYear);
//        ApiResponse<Map<Integer, Long>> response = ApiResponse.<Map<Integer, Long>>builder()
//                .message("Monthly appointment counts retrieved successfully for year " + targetYear)
//                .result(monthlyCounts)
//                .build();
//        return ResponseEntity.ok(response);
//    }

    @GetMapping("/count-current-month")
    public ResponseEntity<ApiResponse<Long>> countAppointmentsForCurrentMonth(
            @AuthenticationPrincipal OAuth2User oAuth2User) {
        String sub = oAuth2User.getAttribute("sub");
        if (sub == null) {
            sub = oAuth2User.getAttribute("id");
        }
        ClinicEntity clinic = clinicRepository.findByOauthSub(sub)
                .orElseThrow(() -> new WebException(ErrorCode.CLINIC_NOT_FOUND));

        Long count = appointmentService.countAppointmentsForCurrentMonthToDate(clinic.getId());

        ApiResponse<Long> response = ApiResponse.<Long>builder()
                .message("Successfully retrieved appointment count for the current month to date.")
                .result(count)
                .build();
        return ResponseEntity.ok(response);
    }
}
