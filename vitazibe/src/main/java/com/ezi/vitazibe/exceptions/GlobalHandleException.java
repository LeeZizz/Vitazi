package com.ezi.vitazibe.exceptions;

import com.ezi.vitazibe.dto.response.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
@Slf4j
public class GlobalHandleException {
    @ExceptionHandler(value = Exception.class)
    ResponseEntity<ApiResponse> handleRuntimeException(Exception exception) {
        ApiResponse apiResponse =new ApiResponse<>();
        log.error("Unhandled exception: ", exception);
        apiResponse.setCode(ErrorCode.NOT_DEFINE_IN_ERROR_CODE.getCode());
        apiResponse.setMessage(ErrorCode.NOT_DEFINE_IN_ERROR_CODE.getMessage());
        return ResponseEntity.badRequest().body(apiResponse);
    }

    @ExceptionHandler
    ResponseEntity<ApiResponse> handleWebException(WebException webException) {
        ErrorCode errorCode = webException.getErrorCode();
        ApiResponse apiResponse =new ApiResponse<>();
        apiResponse.setCode(errorCode.getCode());
        apiResponse.setMessage(errorCode.getMessage());
        return ResponseEntity.status(errorCode.getStatusCode()).body(apiResponse);
    }
}
