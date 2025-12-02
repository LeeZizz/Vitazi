package com.ezi.vitazibe.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse <T> {
    private int code;
    private String message;
    private T result;

    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(888, "Success", data);
    }
}
