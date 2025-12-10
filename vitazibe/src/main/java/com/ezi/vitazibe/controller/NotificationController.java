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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {
    private final NotificationService notificationService;
    private final ClinicRepository clinicRepository;

    @GetMapping("getAllNotifications")
    public ResponseEntity<ApiResponse<Page<NotificationResponse>>> getNotifications(
            @AuthenticationPrincipal OAuth2User oAuth2User,
            @RequestParam(required = false) Status status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size){
        String sub = oAuth2User.getAttribute("sub");
        if (sub == null) {
            sub = oAuth2User.getAttribute("id");
        }

        ClinicEntity clinic = clinicRepository.findByOauthSub(sub)
                .orElseThrow(() -> new WebException(ErrorCode.CLINIC_NOT_FOUND));

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<NotificationResponse> notifications = notificationService.getNotificationsByClinicId(clinic.getId(), status, pageable);
        ApiResponse<Page<NotificationResponse>> response = ApiResponse.<Page<NotificationResponse>>builder()
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

    @GetMapping("/getCountsByStatus")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getNotificationCounts(@AuthenticationPrincipal OAuth2User oAuth2User) {
        String sub = oAuth2User.getAttribute("sub");
        if (sub == null) {
            sub = oAuth2User.getAttribute("id");
        }

        ClinicEntity clinic = clinicRepository.findByOauthSub(sub)
                .orElseThrow(() -> new WebException(ErrorCode.CLINIC_NOT_FOUND));

        Map<String, Long> counts = notificationService.getNotificationCountsByStatus(clinic.getId());
        ApiResponse<Map<String, Long>> response = ApiResponse.<Map<String, Long>>builder()
                .message("Get notification counts successfully")
                .result(counts)
                .build();
        return ResponseEntity.ok(response);
    }
}
