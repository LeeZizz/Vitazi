package com.ezi.vitazibe.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public enum Status {
    PENDING(1, "Đang chờ xác nhận"),
    CONFIRMED(2, "Đã xác nhận"),
    COMPLETED(3, "Đã hoàn thành"),
    CANCELED(4, "Đã hủy bởi người dùng"),
    REJECTED(5, "Bị từ chối bởi phòng khám"),
    NO_SHOW(6, "Người bệnh không đến"),
    RESCHEDULED(7, "Đã được dời lịch");

    private final int code;
    private final String description;
}
