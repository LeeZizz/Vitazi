package com.ezi.vitazibe.controller;

import com.ezi.vitazibe.dto.request.UpdateStatusRequest;
import com.ezi.vitazibe.dto.response.ApiResponse;
import com.ezi.vitazibe.dto.response.NotificationResponse;
import com.ezi.vitazibe.entities.ClinicEntity;
import com.ezi.vitazibe.enums.Status;
import com.ezi.vitazibe.exceptions.ErrorCode;
import com.ezi.vitazibe.exceptions.WebException;
import com.ezi.vitazibe.repositories.ClinicRepository;
import com.ezi.vitazibe.services.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {
    private final NotificationService notificationService;
    private final ClinicRepository clinicRepository;

    @GetMapping("getAllNotifications")
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getNotifications(
            @AuthenticationPrincipal OAuth2User oAuth2User,
            @RequestParam(required = false) Status status){
        String sub = oAuth2User.getAttribute("sub");
        if (sub == null) {
            sub = oAuth2User.getAttribute("id");
        }

        ClinicEntity clinic = clinicRepository.findByOauthSub(sub)
                .orElseThrow(() -> new WebException(ErrorCode.CLINIC_NOT_FOUND));

        List<NotificationResponse> notifications = notificationService.getNotificationsByClinicId(clinic.getId(), status);
        ApiResponse<List<NotificationResponse>> response = ApiResponse.<List<NotificationResponse>>builder()
                .message("Get notifications successfully")
                .result(notifications)
                .build();
        return ResponseEntity.ok(response);
    }

    @PutMapping("/updateStatus/{id}")
    public ResponseEntity<ApiResponse<NotificationResponse>> updateNotificationStatus(
            @PathVariable String id,
            @RequestBody UpdateStatusRequest request) {
        NotificationResponse response = notificationService.updateNotificationStatus(id, request.getStatus());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/getPendingCount")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount(@AuthenticationPrincipal OAuth2User oAuth2User) {
        String sub = oAuth2User.getAttribute("sub");
        if (sub == null) {
            sub = oAuth2User.getAttribute("id");
        }

        ClinicEntity clinic = clinicRepository.findByOauthSub(sub)
                .orElseThrow(() -> new WebException(ErrorCode.CLINIC_NOT_FOUND));

        Long count = notificationService.countPending(clinic.getId());
        ApiResponse<Long> response = ApiResponse.<Long>builder()
                .message("Get PENDING count successfully")
                .result(count)
                .build();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/getConfirmedCount")
    public ResponseEntity<ApiResponse<Long>> getConfirmCount(@AuthenticationPrincipal OAuth2User oAuth2User) {
        String sub = oAuth2User.getAttribute("sub");
        if (sub == null) {
            sub = oAuth2User.getAttribute("id");
        }

        ClinicEntity clinic = clinicRepository.findByOauthSub(sub)
                .orElseThrow(() -> new WebException(ErrorCode.CLINIC_NOT_FOUND));

        Long count = notificationService.countConfirmed(clinic.getId());
        ApiResponse<Long> response = ApiResponse.<Long>builder()
                .message("Get CONFIRM count successfully")
                .result(count)
                .build();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/getCanceledCount")
    public ResponseEntity<ApiResponse<Long>> getCanceledCount(@AuthenticationPrincipal OAuth2User oAuth2User) {
        String sub = oAuth2User.getAttribute("sub");
        if (sub == null) {
            sub = oAuth2User.getAttribute("id");
        }

        ClinicEntity clinic = clinicRepository.findByOauthSub(sub)
                .orElseThrow(() -> new WebException(ErrorCode.CLINIC_NOT_FOUND));

        Long count = notificationService.countCanceled(clinic.getId());
        ApiResponse<Long> response = ApiResponse.<Long>builder()
                .message("Get CONFIRM count successfully")
                .result(count)
                .build();
        return ResponseEntity.ok(response);
    }
}
