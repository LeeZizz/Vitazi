package com.ezi.vitazibe.dto.response;


import com.ezi.vitazibe.enums.Status;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {
    private String id;
    private String clinicId;
    private String userEmail;
    private String title;
    private String message;
    private Status status;
    private LocalDate createdAt;
}
