package com.ezi.vitazibe.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public enum Status {
    PENDING(1, "Chờ xử lý"),
    CONFIRMED(2, "Đã xác nhận"),
    CANCELED(3, "Đã hủy");

    private final int code;
    private final String description;
}
