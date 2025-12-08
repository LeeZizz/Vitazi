package com.ezi.vitazibe.dto.response;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MonthlyCountResponse {
    private Integer month;
    private Long count;
}
