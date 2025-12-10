package com.ezi.vitazibe.controller;

import com.ezi.vitazibe.dto.request.ScheduleRequest;
import com.ezi.vitazibe.dto.response.ApiResponse;
import com.ezi.vitazibe.dto.response.ScheduleResponse;
import com.ezi.vitazibe.services.ScheduleService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/schedules")
@RequiredArgsConstructor
public class ScheduleController {
    private final ScheduleService scheduleService;

    @PostMapping("/createSchedule")
    public ResponseEntity<ApiResponse<ScheduleResponse>> createSchedule(@RequestBody ScheduleRequest scheduleRequest){
        return ResponseEntity.ok(ApiResponse.success(scheduleService.createSchedule(scheduleRequest)));
    }

    @GetMapping("/listSchedules")
    public ResponseEntity<ApiResponse<List<ScheduleResponse>>> getListSchedule(
            @RequestParam String clinicId,
            @RequestParam String departmentId){
        return ResponseEntity.ok(ApiResponse.success(scheduleService.getListSchedule(clinicId, departmentId)));
    }

    @GetMapping("/listActiveSchedules")
    public ResponseEntity<ApiResponse<List<ScheduleResponse>>> getActiveSchedulesByClinicAndDepartmentAndDate(
            @RequestParam String clinicId,
            @RequestParam String departmentId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(ApiResponse.success(scheduleService.getActiveSchedulesByClinicAndDepartmentAndDate(clinicId, departmentId, date)));
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<ApiResponse<ScheduleResponse>> updateSchedule(
            @PathVariable String id,
            @RequestBody ScheduleRequest scheduleRequest){
        return ResponseEntity.ok(ApiResponse.success(scheduleService.updateSchedule(id, scheduleRequest)));
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSchedule(@PathVariable String id){
        scheduleService.deleteSchedule(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
